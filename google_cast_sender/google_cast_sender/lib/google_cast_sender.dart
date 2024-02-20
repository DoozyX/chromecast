// ignore_for_file: public_member_api_docs

import 'package:flutter/widgets.dart';
import 'package:google_cast_sender_platform_interface/google_cast_sender_platform_interface.dart';

GoogleCastSenderPlatform get _platform => GoogleCastSenderPlatform.instance;

class GoogleCastSender {
  static Future<void> load(String url, [String? license, String? jwt]) async {
    await _platform.load(url, license, jwt);
  }

  static Future<void> play() async {
    await _platform.play();
  }

  static Future<void> pause() async {
    await _platform.pause();
  }

  static Future<void> seek(int position) async {
    await _platform.seekTo(position);
  }
}

class CastButton extends StatelessWidget {
  const CastButton({super.key});

  @override
  Widget build(BuildContext context) {
    return _platform.buildView(1);
  }
}
