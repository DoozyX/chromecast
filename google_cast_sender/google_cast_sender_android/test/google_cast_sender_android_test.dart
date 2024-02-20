import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_cast_sender_android/google_cast_sender_android.dart';
import 'package:google_cast_sender_platform_interface/google_cast_sender_platform_interface.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('GoogleCastSenderAndroid', () {
    const kPlatformName = 'Android';
    late GoogleCastSenderAndroid googleCastSender;
    late List<MethodCall> log;

    setUp(() async {
      googleCastSender = GoogleCastSenderAndroid();

      log = <MethodCall>[];
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
          .setMockMethodCallHandler(googleCastSender.methodChannel, (methodCall) async {
        log.add(methodCall);
        switch (methodCall.method) {
          case 'getPlatformName':
            return kPlatformName;
          default:
            return null;
        }
      });
    });

    test('can be registered', () {
      GoogleCastSenderAndroid.registerWith();
      expect(GoogleCastSenderPlatform.instance, isA<GoogleCastSenderAndroid>());
    });

    test('getPlatformName returns correct name', () async {
      final name = await googleCastSender.getPlatformName();
      expect(
        log,
        <Matcher>[isMethodCall('getPlatformName', arguments: null)],
      );
      expect(name, equals(kPlatformName));
    });
  });
}
