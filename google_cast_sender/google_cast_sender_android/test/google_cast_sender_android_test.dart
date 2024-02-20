import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_cast_sender_android/google_cast_sender_android.dart';
import 'package:google_cast_sender_platform_interface/google_cast_sender_platform_interface.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('GoogleCastSenderAndroid', () {
    late GoogleCastSenderAndroid googleCastSender;
    late List<MethodCall> log;

    setUp(() async {
      googleCastSender = GoogleCastSenderAndroid();

      log = <MethodCall>[];
    });

    test('can be registered', () {
      GoogleCastSenderAndroid.registerWith();
      expect(GoogleCastSenderPlatform.instance, isA<GoogleCastSenderAndroid>());
    });

    test('getPlatformName returns correct name', () async {
      await googleCastSender.play();
      expect(
        log,
        <Matcher>[isMethodCall('play', arguments: null)],
      );
    });
  });
}
