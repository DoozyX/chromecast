/// A class representing a Google Cast device.
class CastDevice {
  /// Creates a new [CastDevice] with the given [id] and [name].
  CastDevice({required this.id, required this.name});

  /// The unique identifier for this device.
  final String id;

  /// The name of this device.
  final String name;
}
