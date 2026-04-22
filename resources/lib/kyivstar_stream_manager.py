import bisect
import threading

import xbmc

from collections import deque
from datetime import datetime, timedelta, timezone
from urllib.parse import urljoin

class Stream():
    def __init__(self, url, playlist_url, bandwidth=None, resolution=None, stream_inf=None):
        self.playlist_url = playlist_url
        if stream_inf is not None:
            for pair in stream_inf[18:].split(','):
                if pair.startswith('BANDWIDTH'):
                    bandwidth = pair.split('=')[1]
                elif pair.startswith('RESOLUTION'):
                    resolution = pair.split('=')[1]
        self.stream_inf = stream_inf
        self.url = url
        self.bandwidth = bandwidth
        self.resolution = resolution
        self.start_time = 0.0
        self.reset()

    def reset(self):
        self.finished = False
        self.segments = []
        self.segments_start = []
        self.segments_end = []
        self.discont_indexes = []
        self.target_duration = 0

    def parse(self, text, base_url):
        lines = text.splitlines()

        self.reset()
        segment_tags = []
        segment_duration = 0.0
        segment_offset = 0.0
        segment_discontinuity = False
        for line in lines:
            if line.startswith('#EXT-X-TARGETDURATION:'):
                self.target_duration = int(line[22:])
            elif line == '#EXT-X-DISCONTINUITY':
                segment_tags.append(line)
                segment_discontinuity = True
                pass
            elif line == '#EXT-X-ENDLIST':
                self.finished = True
            elif line.startswith('https://adroll.production.vidmind.com'):
                segment_tags = []
                segment_discontinuity = False
            elif line.startswith('#EXTINF:'):
                segment_tags.append(line)
                segment_duration = float(line[8:len(line)-1])
            elif len(line) > 0 and not line.startswith('#'):
                if not line.startswith('https://'):
                    line = urljoin(base_url, line)
                if segment_discontinuity:
                    self.discont_indexes.append(len(self.segments))
                    segment_discontinuity = False
                self.segments.append({
                    'url' : line,
                    'tags' : segment_tags,
                })
                self.segments_start.append(segment_offset)
                self.segments_end.append(segment_offset + segment_duration)
                segment_tags = []
                segment_offset += segment_duration

    def get_discont_sequence(self, segment_index=None):
        if len(self.segments) == 0:
            return 0

        if segment_index is None:
            segment_index = len(self.segments)

        discont_count = 0
        for discont_index in self.discont_indexes:
            if segment_index < discont_index:
                break
            discont_count += 1

        return discont_count

    def set_start_time(self, cur_time):
        self.start_time = cur_time

    def get_segment_start_time(self, index):
        count = len(self.segments)
        if not (-count <= index < count):
            xbmc.log("KyivstarStreamManager Stream.get_segment_start_time: the index %s is out of range for the segments list with the length %s" % (index, count), xbmc.LOGERROR)
            return 0.0
        return self.segments_start[index] + self.start_time

    def get_segment_end_time(self, index):
        count = len(self.segments)
        if not (-count <= index < count):
            xbmc.log("KyivstarStreamManager Stream.get_segment_end_time: the index %s is out of range for the segments list with the length %s" % (index, count), xbmc.LOGERROR)
            return 0.0
        return self.segments_end[index] + self.start_time

    def get_start_time(self):
        return self.get_segment_start_time(0)

    def get_end_time(self):
        return self.get_segment_end_time(-1)

    def is_in_bound(self, cur_time):
        return self.get_start_time() <= cur_time <= self.get_end_time()

    def get_segment_index(self, cur_time):
        if len(self.segments) == 0:
            return 0
        cur_time -= self.start_time
        index = bisect.bisect(self.segments_start, cur_time) - 1
        return max(0, min(index, len(self.segments) - 1))

class ChannelState():
    def __init__(self, service, asset_id, virtual):
        self.service = service
        self.asset_id = asset_id
        self.virtual = virtual

        self.last_access_time = datetime.now()

        self.program_list = {}
        self.program_index = None

        self.streams = {}
        self.media_sequence = 0
        self.discontinuity_sequence = 0
        self.start_time = 0

        self.stream_infos = {}
        self.stream_ids = {}
        self.free_stream_id = 0

    def get_stream_id(self, stream):
        stream_info = (stream.resolution, stream.bandwidth)
        stream_id = self.stream_infos.get(stream_info)
        if stream_id is not None:
            return stream_id

        self.stream_infos[stream_info] = self.free_stream_id
        self.stream_ids[self.free_stream_id] = { 'resolution' : stream_info[0], 'bandwidth' : stream_info[1], 'alternates' : [] }
        self.free_stream_id += 1

        for i in self.stream_ids:
            self.stream_ids[i]['alternates'] = []
            for j in self.stream_ids:
                if j == i or j in self.stream_ids[i]['alternates']: continue
                if self.stream_ids[i]['resolution'] != self.stream_ids[j]['resolution']: continue
                self.stream_ids[i]['alternates'].append(j)
            for j in self.stream_ids:
                if j == i or j in self.stream_ids[i]['alternates']: continue
                if self.stream_ids[i]['bandwidth'] != self.stream_ids[j]['bandwidth']: continue
                self.stream_ids[i]['alternates'].append(j)
            for j in self.stream_ids:
                if j == i or j in self.stream_ids[i]['alternates']: continue
                self.stream_ids[i]['alternates'].append(j)
        return self.stream_infos[stream_info]

    def get_program_list(self, date_index):
        if date_index in self.program_list:
            return self.program_list[date_index]

        session_id = self.service.addon.getSetting('session_id')
        epg_data = self.service.request.get_elem_epg_data(session_id, self.asset_id, date=date_index, days_before=0, days_after=0)
        if len(epg_data) == 0:
            xbmc.log("KyivstarStreamManager get_program_list: can't load epg data", xbmc.LOGERROR)
            return []

        program_list = []
        for program in epg_data[0].get('programList', []):
            program_list.append({
                'epg' : program['start'],
                'start' : datetime.fromtimestamp(program['start']/1000),
                'end' : datetime.fromtimestamp(program['finish']/1000),
            })
        self.program_list[date_index] = program_list
        return self.program_list[date_index]

    def get_program_index(self, date):
        if date is None:
            return None

        date_index = date.replace(hour=0, minute=0, second=0, microsecond=0)
        program_list = self.get_program_list(date_index)
        if len(program_list) == 0:
            xbmc.log("KyivstarStreamManager get_program_index: program list is empty for the date=%s" % date, xbmc.LOGERROR)
            return None

        if date < program_list[0]['start']:
            date_index -= timedelta(days=1)
            program_list = self.get_program_list(date_index)
        elif date >= program_list[-1]['end']:
            date_index += timedelta(days=1)
            program_list = self.get_program_list(date_index)

        for index, program in enumerate(program_list):
            if date >= program['start'] and date < program['end']:
                return (date_index, index)

        xbmc.log("KyivstarStreamManager get_program_index: can't find the appropriate program index for the date=%s" % date, xbmc.LOGERROR)
        return None

    def get_program(self, program_index):
        if program_index is None:
            return None
        date_index = program_index[0]
        index = program_index[1]
        program_list = self.get_program_list(date_index)
        if index >= len(program_list):
            return None
        return program_list[index]

    def get_streams(self, program_index):
        if program_index in self.streams:
            return self.streams[program_index]

        program = self.get_program(program_index)
        epg = program['epg'] if program else None
        session_id = self.service.addon.getSetting('session_id')
        user_id = self.service.addon.getSetting('user_id')
        if not self.virtual and epg is not None:
            url = self.service.request.get_elem_playback_stream_url(user_id, session_id, self.asset_id, date=epg)
        else:
            url = self.service.request.get_elem_stream_url(user_id, session_id, self.asset_id, virtual=self.virtual, date=epg)
        text = self.service.request.send(url, ret_json=False)
        url = self.service.request.url
        if self.service.request.error or text is None:
            xbmc.log("KyivstarStreamManager get_streams: %s" % self.service.request.error, xbmc.LOGERROR)
            return None

        streams = {}
        stream_inf = None
        lines = text.splitlines()
        for line in lines:
            if line.startswith('#EXT-X-STREAM-INF:'):
                stream_inf = line
            elif len(line) > 0 and not line.startswith('#'):
                if not line.startswith('https://'):
                    line = urljoin(url, line)
                stream = Stream(line, url, stream_inf=stream_inf)
                stream_id = self.get_stream_id(stream)
                streams[stream_id] = stream
        self.streams[program_index] = streams
        return streams

    def get_stream(self, stream_id, program_index, cached=False):
        streams = self.get_streams(program_index)
        if streams is None:
            return None

        if stream_id not in streams:
            if stream_id not in self.stream_ids:
                return None
            for i in self.stream_ids[stream_id]['alternates']:
                if i in streams:
                    stream_id = i
                    break
            if stream_id not in streams:
                xbmc.log("KyivstarStreamManager get_stream: streams for the %s program index doesn't contain an alternative stream for the %s id" % (program_index, stream_id), xbmc.LOGERROR)
                return None

        stream = streams[stream_id]
        reload = not stream.finished
        if cached and len(stream.segments) > 0:
            reload = False
        if reload:
            xbmc.log("KyivstarStreamManager get_stream: loading stream for the %s program index and the %s stream id" % (program_index, stream_id), xbmc.LOGDEBUG)
            text = self.service.request.send(stream.url, ret_json=False)
            if self.service.request.error or text is None:
                if self.service.request.recoverable:
                    return stream
                xbmc.log("KyivstarStreamManager get_stream: %s" % self.service.request.error, xbmc.LOGERROR)
                return None
            stream.parse(text, self.service.request.url)
            stream.set_start_time(self.start_time)
        xbmc.log("KyivstarStreamManager get_stream: got stream for the %s program index and the %s stream id with the %s segments" % (program_index, stream_id, len(stream.segments)), xbmc.LOGDEBUG)

        return stream

    def get_next_program_index(self, program_index):
        date_index = program_index[0]
        index = program_index[1] + 1

        program_list = self.get_program_list(date_index)
        if index < len(program_list):
            xbmc.log("KyivstarStreamManager get_next_program_index: %s -> %s " % (program_index, (date_index, index)), xbmc.LOGDEBUG)
            return (date_index, index)

        date_index += timedelta(days=1)
        index = 0

        program_list = self.get_program_list(date_index)
        if index < len(program_list):
            xbmc.log("KyivstarStreamManager get_next_program_index: %s -> %s " % (program_index, (date_index, index)), xbmc.LOGDEBUG)
            return (date_index, index)

        return None

class SegmentCacheManager():
    def __init__(self, service):
        self.service = service
        self.cache = {}
        self.queue = deque()
        self.queue_set = set()
        self.process_thread = None
        self.process_key = None
        self.queue_event = threading.Event()
        self.lock = threading.Lock()
        self.abort_requested = False

    def process(self):
        wait_time = None
        while not self.abort_requested:
            self.queue_event.wait(timeout=wait_time)
            self.queue_event.clear()

            with self.lock:
                if len(self.queue) == 0:
                    wait_time = None
                    continue
                key = self.queue.popleft()
                self.queue_set.discard(key)
                cache_entry = self.cache.get(key)
                if not cache_entry:
                    wait_time = 0
                    continue
                if cache_entry["content"]:
                    cache_entry["waiter"].set()
                    wait_time = 0
                    continue
                self.process_key = key
                url = cache_entry["url"]

            content = self.service.request.send(url, ret_json=False, ret_binary=True)
            if self.service.request.error:
                xbmc.log("KyivstarStreamManager SegmentCacheManager.process: %s" % self.service.request.error, xbmc.LOGERROR)
                content = None
            if self.service.request.error and wait_time is not None:
                wait_time = min(wait_time + 0.5, 10)
            else:
                wait_time = 0.5

            event = None
            with self.lock:
                self.process_key = None
                cache_entry = self.cache.get(key)
                if not cache_entry:
                    continue
                cache_entry["content"] = content
                cache_entry["waiter"].set()

    def start(self):
        if self.process_thread is not None:
            return
        self.abort_requested = False
        self.process_thread = threading.Thread(target=self.process)
        self.process_thread.start()

    def stop(self):
        if self.process_thread is None:
            return
        self.abort_requested = True
        self.queue_event.set()
        self.process_thread.join()
        self.process_thread = None
        self.clear()

    def get(self, asset_id, segment_id):
        key = (asset_id, segment_id)
        with self.lock:
            cache_entry = self.cache.get(key)
            if not cache_entry:
                return None

            content = cache_entry["content"]
            if content:
                return content

            self.queue.appendleft(key)
            self.queue_set.add(key)
            event = cache_entry["waiter"]

        if not event.wait(5):
            xbmc.log("KyivstarStreamManager SegmentCacheManager.get: timeout while waiting for the segment content for the key %s" % str(key), xbmc.LOGERROR)
            return None

        with self.lock:
            cache_entry = self.cache.get(key)
            if not cache_entry:
                xbmc.log("KyivstarStreamManager SegmentCacheManager.get: the key %s is not in cache after waiting for the content" % str(key), xbmc.LOGERROR)
                return None
            return cache_entry["content"]

    def update(self, asset_id, segment_id, cache_list):
        with self.lock:
            valid_keys = set()
            for i, url in enumerate(cache_list):
                key = (asset_id, segment_id + i)
                valid_keys.add(key)
                cache_entry = self.cache.get(key)
                if not cache_entry:
                    cache_entry = {
                        "content" : None,
                        "waiter" : threading.Event()
                    }
                    self.cache[key] = cache_entry
                if cache_entry["content"] is None:
                    cache_entry["url"] = url
                    if key != self.process_key and key not in self.queue_set:
                        self.queue_set.add(key)
                        self.queue.append(key)

            for key in list(self.cache.keys()):
                if key in valid_keys or key == self.process_key:
                    continue
                del self.cache[key]
                self.queue_set.discard(key)

            xbmc.log("KyivstarStreamManager SegmentCacheManager.update: queue_size=%s cache_size=%s" % (len(self.queue), len(self.cache)), xbmc.LOGDEBUG)
        self.queue_event.set()

    def clear(self):
        with self.lock:
            self.cache = {}
            self.queue.clear()
            self.queue_set.clear()
            self.process_key = None

class KyivstarStreamManager():
    def __init__(self, server):
        self.server = server
        self.service = server.service
        self.channel_states = {}
        self.window_length = 60
        self.segment_cache = SegmentCacheManager(self.service)
        self.segment_cache.start()

    def check_active_states(self):
        outdated_states = []
        time_limit = datetime.now() - timedelta(minutes=30)
        for asset_id in self.channel_states:
            channel_state = self.channel_states[asset_id]
            if channel_state.last_access_time < time_limit:
                outdated_states.append(asset_id)

        for asset_id in outdated_states:
            del self.channel_states[asset_id]
        xbmc.log("KyivstarStreamManager check_active_states: active=%s outdated=%s" % (len(self.channel_states), len(outdated_states)), xbmc.LOGDEBUG)

    def get_playlist_content(self, asset_id, virtual, epg):
        if epg is None:
            date = datetime.now()
        elif epg < 0:
            date = None
        else:
            date = datetime.fromtimestamp(epg/1000)

        if asset_id not in self.channel_states:
            self.channel_states[asset_id] = ChannelState(self.service, asset_id, virtual)
        channel_state = self.channel_states[asset_id]
        channel_state.last_access_time = datetime.now()
        self.check_active_states()

        program_index = channel_state.get_program_index(date)
        if program_index is None and date is not None:
            return None

        streams = channel_state.get_streams(program_index)
        if streams is None:
            return None

        server_address = self.server.server_address
        base_url = f"http://{server_address[0]}:{server_address[1]}/chunklist.m3u8"
        base_url += f"?asset={asset_id}{'' if epg is None else '&epg=' + str(epg)}&stream="
        text = "#EXTM3U\n#EXT-X-VERSION:3\n"
        for i in streams:
            text += streams[i].stream_inf + "\n"
            text += base_url + str(i) + "\n"
        return text

    def get_chunklist_content(self, asset_id, stream_id, epg=None):
        live = False
        if epg is None:
            date = datetime.now()
            live = True
        elif epg < 0:
            date = None
        else:
            date = datetime.fromtimestamp(epg/1000)

        channel_state = self.channel_states.get(asset_id)
        if channel_state is None:
            xbmc.log("KyivstarStreamManager get_chunklist_content: the asset %s has no channel state" % asset_id, xbmc.LOGERROR)
            return None
        channel_state.last_access_time = datetime.now()

        cache_size = int(self.service.addon.getSetting('segment_cache_size'))
        cache_enabled = True
        if channel_state.virtual:
            cache_enabled = self.service.addon.getSetting('segment_cache_virtual_enabled') == 'true'
        elif live:
            date = date - timedelta(seconds=cache_size)

        if live:
            date = date - timedelta(seconds=self.window_length)
            program_index = channel_state.program_index
            if program_index is None:
                program_index = channel_state.get_program_index(date)
                program = channel_state.get_program(program_index)
                channel_state.start_time = program['epg']/1000 if program else 0
        else:
            program_index = channel_state.get_program_index(date)
        if program_index is None and date is not None:
            return None

        stream = channel_state.get_stream(stream_id, program_index)
        if stream is None:
            return None

        if live:
            if channel_state.program_index is None:
                channel_state.program_index = program_index
            elif not stream.is_in_bound(date.timestamp()):
                new_program_index = channel_state.get_program_index(date)
                next_program_index = channel_state.get_next_program_index(program_index)
                if new_program_index == program_index or new_program_index == next_program_index:
                    program_index = next_program_index
                    channel_state.media_sequence += len(stream.segments)
                    channel_state.discontinuity_sequence += stream.get_discont_sequence() + 1
                    channel_state.start_time = stream.get_end_time()
                else:
                    program_index = new_program_index
                    channel_state.media_sequence = 0
                    channel_state.discontinuity_sequence = 0
                    program = channel_state.get_program(program_index)
                    channel_state.start_time = program['epg']/1000 if program else 0
                channel_state.program_index = program_index

                stream = channel_state.get_stream(stream_id, program_index)
                if stream is None:
                    return None
                stream.set_start_time(channel_state.start_time)

        start_index = 0
        end_index = len(stream.segments)
        if live:
            start_index = stream.get_segment_index(date.timestamp())
            end_date = date + timedelta(seconds=self.window_length)
            if stream.is_in_bound(end_date.timestamp()):
                end_index = stream.get_segment_index(end_date.timestamp())

        text = "#EXTM3U\n#EXT-X-VERSION:3\n"
        text += "#EXT-X-TARGETDURATION:%s\n" % stream.target_duration
        media_sequence = channel_state.media_sequence + start_index
        text += "#EXT-X-MEDIA-SEQUENCE:%s\n" % media_sequence
        discontinuity_sequence = channel_state.discontinuity_sequence + stream.get_discont_sequence(start_index)
        text += "#EXT-X-DISCONTINUITY-SEQUENCE:%s\n\n" % discontinuity_sequence

        base_url = f"http://{self.server.server_address[0]}:{self.server.server_address[1]}/segment.ts"
        base_url += f"?asset={asset_id}&stream={stream_id}{'' if epg is None else '&epg=' + str(epg)}&segment="

        base_sequence = channel_state.media_sequence
        for i in range(start_index, end_index):
            segment = stream.segments[i]
            if live:
                text += '#EXT-X-PROGRAM-DATE-TIME:%s\n' % datetime.fromtimestamp(stream.get_segment_start_time(i), tz=timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
            for tag in segment['tags']:
                text += tag + '\n'
            if cache_enabled:
                text += base_url + str(base_sequence + i) + '\n'
            else:
                text += segment['url'] + '\n'

        xbmc.log("KyivstarStreamManager get_chunklist_content: asset_id=%s stream_id=%s epg=%s disc=%s program_index=%s stream_segments=%s start_index=%s end_index=%s" % (asset_id, stream_id, epg, discontinuity_sequence, program_index, len(stream.segments), start_index, end_index), xbmc.LOGDEBUG)

        if not live or start_index >= len(stream.segments):
            text += '#EXT-X-ENDLIST\n'
            return text

        if stream.is_in_bound(end_date.timestamp()):
            return text

        base_sequence += len(stream.segments)
        start_time = stream.get_end_time()
        program_index = channel_state.get_next_program_index(program_index)

        stream = channel_state.get_stream(stream_id, program_index)
        if stream is None:
            return None

        stream.set_start_time(start_time)

        start_index = 0
        end_index = len(stream.segments)
        if stream.is_in_bound(end_date.timestamp()):
            end_index = stream.get_segment_index(end_date.timestamp())

        for i in range(start_index, end_index):
            segment = stream.segments[i]
            if i == start_index:
                text += '#EXT-X-DISCONTINUITY\n'
            text += '#EXT-X-PROGRAM-DATE-TIME:%s\n' % datetime.fromtimestamp(stream.get_segment_start_time(i), tz=timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
            for tag in segment['tags']:
                text += tag + '\n'
            if cache_enabled:
                text += base_url + str(base_sequence + i) + '\n'
            else:
                text += segment['url'] + '\n'

        xbmc.log("KyivstarStreamManager get_chunklist_content: asset_id=%s stream_id=%s epg=%s live=%s program_index=%s stream_segments=%s start_index=%s end_index=%s" % (asset_id, stream_id, epg, live, program_index, len(stream.segments), start_index, end_index), xbmc.LOGDEBUG)

        return text

    def get_segment_content(self, asset_id, stream_id, segment_id, epg):
        live = False
        if epg is None:
            date = datetime.now()
            live = True
        elif epg < 0:
            date = None
        else:
            date = datetime.fromtimestamp(epg/1000)

        channel_state = self.channel_states.get(asset_id)
        if channel_state is None:
            xbmc.log("KyivstarStreamManager get_segment_content: the asset %s has no channel state" % asset_id, xbmc.LOGERROR)
            return None
        channel_state.last_access_time = datetime.now()

        if live:
            program_index = channel_state.program_index
        else:
            program_index = channel_state.get_program_index(date)
        if program_index is None and date is not None:
            return None

        stream = channel_state.get_stream(stream_id, program_index, cached=True)
        if stream is None:
            return None

        cache_start = segment_id - channel_state.media_sequence
        if cache_start >= len(stream.segments):
            cache_start -= len(stream.segments)
            program_index = channel_state.get_next_program_index(program_index)

            stream = channel_state.get_stream(stream_id, program_index, cached=True)
            if stream is None:
                return None

        cache_size = int(self.service.addon.getSetting('segment_cache_size'))
        cache_list = []
        i = cache_start
        while i < len(stream.segments) and cache_size > 0:
            cache_list.append(stream.segments[i]["url"])
            cache_size -= stream.segments_end[i] - stream.segments_start[i]
            i += 1

        if live and stream.finished and cache_size > 0:
            program_index = channel_state.get_next_program_index(program_index)

            stream = channel_state.get_stream(stream_id, program_index, cached=True)
            if stream is None:
                return None

            i = 0
            while i < len(stream.segments) and cache_size > 0:
                cache_list.append(stream.segments[i]["url"])
                cache_size -= stream.segments_end[i] - stream.segments_start[i]
                i += 1

        self.segment_cache.update(asset_id, segment_id, cache_list)

        return self.segment_cache.get(asset_id, segment_id)
