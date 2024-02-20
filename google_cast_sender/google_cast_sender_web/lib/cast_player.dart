// ignore_for_file: public_member_api_docs

@JS('CastPlayerPlayer')
library smart_web_player;

import 'dart:html' as html;

import 'package:js/js.dart';

@JS()
class Promise<T> {
  external factory Promise(
    dynamic Function(
      dynamic Function(dynamic value) resolve,
      dynamic Function(dynamic error) reject,
    ) executor,
  );
}

@JS()
class CastPlayer {
  external factory CastPlayer();

  external html.Element viewElement();

  external Promise<void> init();

  external Promise<void> destroy();

  external Promise<void> setSrc(String url, [String? licenseUrl, String? jwt]);

  external Promise<void> play();

  external Promise<void> pause();

  external Promise<void> seekTo(num position);
}
