// ignore_for_file: public_member_api_docs

import 'package:flutter/widgets.dart';
import 'package:google_cast_sender_platform_interface/google_cast_sender_platform_interface.dart';

GoogleCastSenderPlatform get _platform => GoogleCastSenderPlatform.instance;

/// Returns the name of the current platform.
Future<String> getPlatformName() async {
  await _platform.play();
  // if (platformName == null) throw Exception('Unable to get platform name.');
  return 'asd';
}

class CastButton extends StatelessWidget {
  const CastButton({super.key});

  @override
  Widget build(BuildContext context) {
    return _platform.buildView(1);
  }
}
