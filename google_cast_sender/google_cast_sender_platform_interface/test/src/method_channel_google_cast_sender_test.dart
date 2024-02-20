import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_cast_sender_platform_interface/src/method_channel_google_cast_sender.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  const kPlatformName = 'platformName';

  group('$MethodChannelGoogleCastSender', () {
    late MethodChannelGoogleCastSender methodChannelGoogleCastSender;
    final log = <MethodCall>[];

    setUp(() async {
      methodChannelGoogleCastSender = MethodChannelGoogleCastSender();
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
          .setMockMethodCallHandler(
        methodChannelGoogleCastSender.methodChannel,
        (methodCall) async {
          log.add(methodCall);
          switch (methodCall.method) {
            case 'getPlatformName':
              return kPlatformName;
            default:
              return null;
          }
        },
      );
    });

    tearDown(log.clear);

    // test('getPlatformName', () async {
    //   final platformName =
    //      await methodChannelGoogleCastSender.getPlatformName();
    //   expect(
    //     log,
    //     <Matcher>[isMethodCall('getPlatformName', arguments: null)],
    //   );
    //   expect(platformName, equals(kPlatformName));
    // });
  });
}
