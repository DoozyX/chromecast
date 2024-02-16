import 'package:google_cast_sender_platform_interface/google_cast_sender_platform_interface.dart';

GoogleCastSenderPlatform get _platform => GoogleCastSenderPlatform.instance;

/// Returns the name of the current platform.
Future<String> getPlatformName() async {
  final platformName = await _platform.getPlatformName();
  if (platformName == null) throw Exception('Unable to get platform name.');
  return platformName;
}
