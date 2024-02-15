type DrmType = 'widevine' | 'fairplay' | 'clearkey';
interface Drm {
    type: DrmType;
    data: {
        certificateUrl?: string;
        licenseUrl: string;
    };
    headers?: any;
}
interface Quality {
    id: string;
    width?: number;
    height?: number;
    bitrate?: number;
}
interface SubtitleTrack {
    index: number;
    language: string;
}
interface BufferedRange {
    start: number;
    end: number;
}
interface Size {
    width: number;
    height: number;
}
interface PlayerEvent {
    key: string;
    type: 'completed' | 'play' | 'pause' | 'stop' | 'bufferingStart' | 'bufferingEnd' | 'bufferingUpdate' | 'initialized' | 'error';
    buffered?: BufferedRange[];
    duration?: number;
    size?: Size;
}
type PlayerEventCallback = (event: PlayerEvent) => void;
declare abstract class BasePlayer {
    abstract isInitialized(): boolean;
    abstract viewElement(): HTMLElement;
    abstract init(): Promise<void>;
    abstract destroy(): Promise<void>;
    abstract setSrc(url: string, drm?: Drm): Promise<void>;
    abstract play(): Promise<void>;
    abstract pause(): Promise<void>;
    abstract stop(): Promise<void>;
    abstract seekTo(position: number): Promise<void>;
    abstract position(): Promise<number>;
    abstract setVolume(volume: number): Promise<void>;
    abstract setAudioTrack(index: number, language: string, languageCode: string): Promise<void>;
    abstract setSubtitleTrack(index: number, language: String): Promise<void>;
    abstract getSubtitleTracks(): Promise<SubtitleTrack[]>;
    abstract getQualities(): Promise<Quality[]>;
    abstract setQuality(bitrate?: number, width?: number, height?: number): any;
    abstract onEvent(listener: PlayerEventCallback): void;
}

declare function getSmartPlayer(): BasePlayer;

export { getSmartPlayer };
