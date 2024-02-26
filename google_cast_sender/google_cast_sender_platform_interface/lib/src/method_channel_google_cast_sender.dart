import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:google_cast_sender_platform_interface/google_cast_sender_platform_interface.dart';

/// An implementation of [GoogleCastSenderPlatform] that uses method channels.
class MethodChannelGoogleCastSender extends GoogleCastSenderPlatform {
  /// The method channel used to interact with the native platform.
  @visibleForTesting
  final methodChannel = const MethodChannel('google_cast_sender');

  @override
  Future<void> load(String url, [String? licenseUrl, String? jwt]) {
    throw UnimplementedError();
  }

  @override
  Future<void> play() {
    return methodChannel.invokeMethod<void>('play');
  }

  @override
  Future<void> pause() {
    return methodChannel.invokeMethod<void>('pause');
  }

  @override
  Future<void> seekTo(num position) {
    return methodChannel.invokeMethod<void>('seekTo', position);
  }

  @override
  Widget buildView(int? textureId) {
    throw UnimplementedError();
  }

  @override
  Future<void> init() {
    throw UnimplementedError();
  }

  @override
  Future<List<CastDevice>> listDevices() {
    throw UnimplementedError();
  }
}
