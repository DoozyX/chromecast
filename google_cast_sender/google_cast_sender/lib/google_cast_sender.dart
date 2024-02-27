// ignore_for_file: public_member_api_docs

import 'package:flutter/widgets.dart';
import 'package:google_cast_sender_platform_interface/google_cast_sender_platform_interface.dart';

export 'package:google_cast_sender_platform_interface/google_cast_sender_platform_interface.dart';

GoogleCastSenderPlatform get _platform => GoogleCastSenderPlatform.instance;

class GoogleCastSender {
  Future<List<CastDevice>> listDevices() async {
    return _platform.listDevices();
  }

  Future<void> connect(String id) async {
    await _platform.connect(id);
  }

  Future<void> load(String url, [String? license, String? jwt]) async {
    await _platform.load(url, license, jwt);
  }

  Future<void> play() async {
    await _platform.play();
  }

  Future<void> pause() async {
    await _platform.pause();
  }

  Future<void> seek(int position) async {
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
