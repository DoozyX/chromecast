import 'package:flutter/widgets.dart';
import 'package:google_cast_sender_platform_interface/src/method_channel_google_cast_sender.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';

/// The interface that implementations of google_cast_sender must implement.
///
/// Platform implementations should extend this class
/// rather than implement it as `GoogleCastSender`.
/// Extending this class (using `extends`) ensures that the subclass will get
/// the default implementation, while platform implementations that `implements`
/// this interface will be broken by newly added [GoogleCastSenderPlatform]
/// methods.
abstract class GoogleCastSenderPlatform extends PlatformInterface {
  /// Constructs a GoogleCastSenderPlatform.
  GoogleCastSenderPlatform() : super(token: _token);

  static final Object _token = Object();

  static GoogleCastSenderPlatform _instance = MethodChannelGoogleCastSender();

  /// The default instance of [GoogleCastSenderPlatform] to use.
  ///
  /// Defaults to [MethodChannelGoogleCastSender].
  static GoogleCastSenderPlatform get instance => _instance;

  /// Platform-specific plugins should set this with their own platform-specific
  /// class that extends [GoogleCastSenderPlatform] when they register
  /// themselves.
  static set instance(GoogleCastSenderPlatform instance) {
    PlatformInterface.verify(instance, _token);
    _instance = instance;
  }

  /// Initialize the platform interface.
  Future<void> init();

  /// Load a media from a url.
  Future<void> load(String url, [String? licenseUrl, String? jwt]);

  /// play the current media.
  Future<void> play();

  /// pause the current media.
  Future<void> pause();

  /// seek to position in ms the current media.
  Future<void> seekTo(num position);

  /// Returns a widget displaying the cast icon with a given textureID.
  Widget buildView(int? textureId);
}