import 'package:flutter/widgets.dart';
import 'package:google_cast_sender_android/src/messages.g.dart';
import 'package:google_cast_sender_platform_interface/google_cast_sender_platform_interface.dart';

/// The Android implementation of [GoogleCastSenderPlatform].
class GoogleCastSenderAndroid extends GoogleCastSenderPlatform {
  final _api = GoogleCastSenderApi();

  /// Registers this class as the default instance of [GoogleCastSenderPlatform]
  static void registerWith() {
    GoogleCastSenderPlatform.instance = GoogleCastSenderAndroid();
  }

  @override
  Widget buildView(int? textureId) {
    throw UnimplementedError();
  }

  @override
  Future<void> init() {
    return _api.init();
  }

  @override
  Future<void> load(String url, [String? licenseUrl, String? jwt]) {
    return _api.load(url, licenseUrl, jwt);
  }

  @override
  Future<void> pause() {
    return _api.pause();
  }

  @override
  Future<void> play() {
    return _api.play();
  }

  @override
  Future<void> seekTo(num position) {
    return _api.seekTo(position.toInt());
  }
}
