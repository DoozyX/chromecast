import 'package:collection/collection.dart';
import 'package:flutter/widgets.dart';
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
  Future<List<CastDevice>> listDevices() async {
    final devices = await _api.listDevices();
    return devices
        .whereNotNull()
        .map((device) => CastDevice(id: device.id, name: device.name))
        .toList();
  }

  @override
  Future<void> connect(String id) {
    return _api.connect(id);
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
