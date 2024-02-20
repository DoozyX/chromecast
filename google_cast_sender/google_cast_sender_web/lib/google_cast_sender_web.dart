import 'dart:ui' as ui;
import 'package:flutter/widgets.dart';
import 'package:google_cast_sender_platform_interface/google_cast_sender_platform_interface.dart';
import 'package:google_cast_sender_web/cast_player.dart';

/// The Web implementation of [GoogleCastSenderPlatform].
class GoogleCastSenderWeb extends GoogleCastSenderPlatform {
  /// The player instance.
  final CastPlayer player = CastPlayer();

  /// The texture uid.
  final String textureUid = 'better_player_web_view';

  /// Registers this class as the default instance of [GoogleCastSenderPlatform]
  static void registerWith([Object? registrar]) {
    GoogleCastSenderPlatform.instance = GoogleCastSenderWeb();
  }

  @override
  Future<void> init() async {
    final view = player.viewElement();
    // ignore: undefined_prefixed_name
    ui.platformViewRegistry.registerViewFactory(textureUid, (int id) => view);
  }

  @override
  Future<void> load(String url, [String? licenseUrl, String? jwt]) {
    throw UnimplementedError('load() has not been implemented.');
  }

  @override
  Future<void> play() {
    throw UnimplementedError('play() has not been implemented.');
  }

  @override
  Future<void> pause() {
    throw UnimplementedError('pause() has not been implemented.');
  }

  @override
  Future<void> seekTo(num position) {
    throw UnimplementedError('seekTo() has not been implemented.');
  }

  @override
  Widget buildView(int? textureId) {
    return HtmlElementView(viewType: textureUid);
  }
}
