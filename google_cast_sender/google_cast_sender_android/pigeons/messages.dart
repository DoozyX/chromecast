import 'package:pigeon/pigeon.dart';

@ConfigurePigeon(
  PigeonOptions(
    dartPackageName: 'google_cast_sender',
    dartOut: 'lib/src/messages.g.dart',
    dartTestOut: 'test/test_api.g.dart',
    kotlinOut:
        'android/src/main/kotlin/com/doozyx/plugins/google_cast_sender/Messages.g.kt',
    kotlinOptions: KotlinOptions(
      package: 'com.doozyx.plugins.google_cast_sender',
    ),
  ),
)
@HostApi(dartHostTestHandler: 'TestHostGoogleCastSenderApi')
abstract class GoogleCastSenderApi {
  /// Initialize the platform interface.
  void init();

  /// Load a media from a url.
  void load(String url, [String? licenseUrl, String? jwt]);

  /// play the current media.
  void play();

  /// pause the current media.
  void pause();

  /// seek to position in ms the current media.
  void seekTo(int position);
}
