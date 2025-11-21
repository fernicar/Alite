# Conversion Plan

This document outlines the high-level plan for converting the Alite game from Java to TypeScript, based on the user's direct instructions.

## Core Principles

1.  **Sequential, One-Pass Conversion:** All files listed in this document will be converted one by one, in order. Each file will be fully converted in a single pass without pausing to handle dependencies.
2.  **No Dependency Chasing:** The conversion of one file will not be stopped to convert its dependencies. The logic will be written as if all other classes and methods already exist in TypeScript.
3.  **No Stubs or Deletions of the code logic unless deprecated:** All Java logic within a file will be converted to TypeScript. No code will be deleted or replaced with placeholders/stubs, unless deprecated (see Google Dependencies).
4.  **No Testing or Compilation or tools to test if the conversion went right:** The sole focus is the direct translation of code logic. No tests will be run, and no attempt will be made to verify compilation. The user is responsible for all testing and debugging after the conversion phase is complete.

## Implementation Details & Assumptions

*   **Google Dependencies are deprecated:** All Google Play and Android Vending dependencies are considered deprecated and will be removed if encountered.
*   **Controls (Spaceship Piloting):**
    *   **Primary Gyroscope:** Mapped to mouse movement for steering.
    *   **Secondary Gyroscope:** Mapped to `Ctrl` + mouse movement.
    *   **Touchscreen Input:** Mapped to `Shift` + mouse click. Holding `Shift` will temporarily disable mouse-based steering to allow for clicking UI elements without altering the ship's course.
*   **Agent Responsibilities:**
    *   The agent **will not** use the "stub method."
    *   The agent **will not** perform any testing or compilation verification.
    *   Each file must be converted in a single pass.
*   **Phase Completion:** This initial conversion phase is considered complete once every file in the list has been converted once.

---

[ ] `gen/de/phbouillon/android/games/alite/BuildConfig.tsx`
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/space/AiStateCallback.tsx`
[x] `src/de/phbouillon/android/framework/TimeFactorChangeListener.tsx`
[x] `src/de/phbouillon/android/framework/IMethodHook.tsx`
[x] `src/de/phbouillon/android/framework/impl/IAccelerometerHandler.tsx`
[x] `src/de/phbouillon/android/framework/IntFunction.tsx`
[x] `src/de/phbouillon/android/framework/MemUtil.tsx`
[x] `src/de/phbouillon/android/framework/ResourceStream.tsx`
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/space/AiStateCallbackHandler.tsx`
[x] `src/com/google/android/vending/licensing/util/Base64DecoderException.tsx` (deprecated)
[x] `src/de/phbouillon/android/framework/Audio.tsx`
[x] `src/com/google/android/vending/licensing/ValidationException.tsx` (deprecated)
[x] `src/de/phbouillon/android/framework/Game.tsx`
[x] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/ScoopCallback.tsx`
[x] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/SpaceObjectTraverser.tsx`
[x] `src/de/phbouillon/android/games/alite/Component.tsx`
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/space/curves/ConstCurveParameter.tsx`
[x] `src/de/phbouillon/android/framework/Music.tsx`
[x] `src/de/phbouillon/android/games/alite/Loggable.tsx`
- [x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/PlanetSpaceObject.tsx` (A class that represents a planet in space, handling its appearance, including rings and atmosphere.)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/space/AIMethod.tsx`
[x] `src/com/google/android/vending/licensing/NullDeviceLimiter.tsx` (deprecated)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/space/curves/CurveParameterKey.tsx`
[x] `src/de/phbouillon/android/games/alite/screens/canvas/TextData.tsx`
[x] `src/de/phbouillon/android/games/alite/model/LegalStatus.tsx`
[x] `src/de/phbouillon/android/framework/impl/TouchHandler.tsx`
[x] `src/de/phbouillon/android/framework/Sound.tsx`
[x] `src/de/phbouillon/android/framework/PluginManager.tsx`
[x] `src/de/phbouillon/android/games/alite/model/Unit.tsx`
[x] `src/de/phbouillon/android/framework/Pixmap.tsx`
[x] `src/de/phbouillon/android/framework/Texture.tsx`
[x] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/DepthBucket.tsx`
[x] `src/de/phbouillon/android/games/alite/model/library/TocEntry.tsx`
[x] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/ObjectType.tsx`
[x] `src/de/phbouillon/android/games/alite/model/library/ItemDescriptor.tsx`
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/TargetBoxSpaceObject.tsx`
[x] `src/de/phbouillon/android/games/alite/io/AliteAlarmReceiver.tsx` (Android-specific BroadcastReceiver for downloader alarms, stubbed as it's not needed)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/AttackTraverser.tsx`
[x] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/CloakingEvent.tsx`
[x] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/JammingEvent.tsx`
[x] `src/de/phbouillon/android/framework/impl/gl/font/CharacterData.tsx`
[x] `src/com/google/android/vending/expansion/downloader/IStub.tsx` (deprecated)
[x] `src/de/phbouillon/android/framework/SpriteData.tsx`
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/DiskSpaceObject.tsx`
[x] `src/de/phbouillon/android/games/alite/screens/opengl/sprites/buttons/ButtonGroup.tsx` (Represents a group of on-screen buttons, managing their state and properties)
[x] `src/de/phbouillon/android/games/alite/model/trading/AliteMarket.tsx` (Generates market data for trade goods based on the current system's economy)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/CylinderSpaceObject.tsx` (Represents a cylinder-shaped space object, wrapping a Cylinder graphical object)
[x] `src/de/phbouillon/android/framework/Screen.tsx` (Abstract base class defining the lifecycle and rendering methods for all game screens)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/SkySphereSpaceObject.tsx` (Represents the skysphere/starfield background of the game)
[x] `test/de/phbouillon/android/games/alite/TestLogger.tsx` (A simple logger implementation for testing purposes, writes to the console)
[x] `src/de/phbouillon/android/games/alite/model/Condition.tsx` (Enum representing the ship's status, e.g., DOCKED, GREEN, YELLOW, RED)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/sprites/buttons/EnergyBombTraverser.tsx` (Handles the logic for applying energy bomb effects to space objects)
[x] `src/de/phbouillon/android/games/alite/ShipControl.tsx`
[x] `src/de/phbouillon/android/games/alite/model/generator/SeedType.tsx` (A data structure for holding the seed values used in galaxy generation)
[x] `src/de/phbouillon/android/games/alite/AliteConfig.tsx` (Contains static configuration constants for the game)
[x] `src/de/phbouillon/android/games/alite/model/generator/enums/Government.tsx` (Enum representing the different government types in the game)
[x] `src/com/dd/plist/PropertyListFormatException.tsx` (Custom exception for property list parsing errors)
[x] `src/de/phbouillon/android/games/alite/screens/canvas/LocalScreen.tsx` (Screen for displaying the local navigation chart)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/SphericalSpaceObject.tsx` (Represents a spherical space object, like a planet or sun)
[x] `src/de/phbouillon/android/games/alite/model/missions/EndMission.tsx` (Represents the final mission of the game)
[x] `test/de/phbouillon/android/framework/TestInput.tsx` (A test implementation of the Input interface, providing default return values)
[x] `src/de/phbouillon/android/games/alite/io/AliteDownloaderService.tsx` (Android-specific downloader service, stubbed as it's not needed)
[x] `test/de/phbouillon/android/games/alite/screens/opengl/TestTexture.tsx` (A test implementation of the Texture interface, providing stubbed methods)
[x] `src/de/phbouillon/android/games/alite/model/Rating.tsx` (Enum representing the player's combat rating)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/sprites/buttons/ButtonData.tsx` (Data class for on-screen button properties and state)
[x] `src/com/google/android/vending/licensing/Obfuscator.tsx` (deprecated)
[x] `src/de/phbouillon/android/games/alite/model/CommanderData.tsx` (Data class for holding saved commander profile information)
[x] `src/de/phbouillon/android/framework/GlScreen.tsx` (Abstract base class for screens that use OpenGL rendering)
[x] `src/de/phbouillon/android/games/alite/oxp/PListParser.tsx` (Parser for property list (.plist) files used for configuration and data)
[x] `src/de/phbouillon/android/games/alite/screens/canvas/missions/MissionLine.tsx` (Represents a line of dialogue in a mission, with associated text and audio)
[x] `src/com/google/android/vending/licensing/DeviceLimiter.tsx` (deprecated)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/ExplosionBillboard.tsx` (Represents an animated explosion effect)
[x] `src/com/google/android/vending/licensing/Policy.tsx` (deprecated)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/HyperspaceTimer.tsx` (Manages the countdown timer for hyperspace jumps)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/BoxSpaceObject.tsx` (Represents a box-shaped space object, wrapping a Box graphical object)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/sprites/buttons/TorusBlockingTraverser.tsx` (Determines if objects are blocking the torus drive)
[x] `src/de/phbouillon/android/framework/Rect.tsx`
[x] `src/de/phbouillon/android/framework/impl/Pool.tsx` (A generic object pool for recycling objects to improve performance)
[x] `src/de/phbouillon/android/framework/impl/AndroidSound.tsx` (Android-specific sound playback, stubbed for replacement with Web Audio)
[x] `src/de/phbouillon/android/framework/FileIO.tsx` (Interface for file input/output operations)
[x] `src/de/phbouillon/android/framework/Input.tsx`
[x] `src/de/phbouillon/android/framework/impl/PulsingHighlighter.tsx` (Renders a pulsing highlight effect for UI elements)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/sprites/buttons/ECMTraverser.tsx` (Handles the logic for the ECM system, destroying incoming missiles)
[x] `src/de/phbouillon/android/games/alite/model/generator/enums/Economy.tsx` (Enum representing the different economy types in the game)
[x] `test/de/phbouillon/android/games/alite/screens/opengl/objects/space/SpaceObjectTest.tsx` (Test for the random enemy generation algorithm)
[x] `src/de/phbouillon/android/framework/impl/gl/Skysphere.tsx` (Renders the skysphere/starfield background)
[x] `src/de/phbouillon/android/framework/Plugin.tsx` (Data class representing a plugin)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/LaserBillboard.tsx` (Represents a laser blast as a billboarded sprite)
[x] `src/com/google/android/vending/licensing/PreferenceObfuscator.tsx` (deprecated)
[x] `src/com/google/android/vending/licensing/ResponseData.tsx` (deprecated)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/ScrollingText.tsx` (Renders the scrolling text that appears when the game is paused)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/TimedEvent.tsx` (Handles scheduled events in the game)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/space/MathHelper.tsx` (Utility class for mathematical operations)
[x] `src/de/phbouillon/android/framework/impl/gl/GlUtils.tsx` (Utility class for OpenGL operations, stubbed for WebGL)
[x] `src/com/google/android/vending/licensing/LicenseCheckerCallback.tsx` (deprecated)
[x] `src/de/phbouillon/android/framework/Language.tsx` (Interface for handling localization and internationalization)
[x] `src/com/google/android/vending/expansion/downloader/DownloadProgressInfo.tsx` (deprecated)
[x] `src/de/phbouillon/android/games/alite/model/InventoryItem.tsx` (Data class for items in the player's inventory)
[x] `src/de/phbouillon/android/games/alite/model/generator/StringUtil.tsx` (Utility class for string manipulation, formatting, and hashing)
[x] `src/de/phbouillon/android/games/alite/model/trading/Market.tsx`
[x] `src/de/phbouillon/android/framework/Timer.tsx` (Utility class for measuring time intervals)
[x] `src/com/android/vending/expansion/zipfile/APKExpansionSupport.tsx` (deprecated)
[x] `src/de/phbouillon/android/games/alite/screens/canvas/QuitScreen.tsx` (Screen for confirming if the user wants to quit the game)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/space/curves/BreakUp.tsx` (Defines a specific "break up" flight maneuver as a curve)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/space/curves/BreakDown.tsx` (Defines a specific "break down" flight maneuver as a curve)
[x] `src/com/google/android/vending/expansion/downloader/IDownloaderService.tsx` (deprecated)
[x] `src/com/dd/plist/UID.tsx` (Represents a UID from a binary property list)
[x] `src/com/google/android/vending/expansion/downloader/impl/DownloadInfo.tsx` (deprecated)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/space/WayPoint.tsx` (Represents a waypoint for AI navigation, using an object pool)
[x] `test/de/phbouillon/android/framework/TestFileIO.tsx` (A test implementation of the FileIO interface, providing stubbed methods)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/WitchSpaceRender.tsx` (Manages the state and events for witch-space)
[x] `src/de/phbouillon/android/framework/impl/AndroidAudio.tsx` (Android-specific audio management, stubbed for replacement with Web Audio)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/sprites/ShipController.tsx` (Abstract base class for ship control schemes)
[x] `src/de/phbouillon/android/games/alite/model/EquipmentStore.tsx` (Singleton for managing all available equipment in the game)
[x] `src/de/phbouillon/android/games/alite/io/AliteFiles.tsx` (Handles Android OBB expansion file mounting, stubbed for PC port)
[x] `src/de/phbouillon/android/games/alite/screens/canvas/tutorial/TutorialSelectionScreen.tsx` (Screen for selecting a tutorial to play)
[x] `src/com/google/android/vending/licensing/ILicenseResultListener.tsx` (deprecated)
[x] `src/de/phbouillon/android/framework/impl/gl/TargetBox.tsx` (Creates and renders a wireframe target box)
[x] `src/de/phbouillon/android/framework/Graphics.tsx`
[x] `src/de/phbouillon/android/games/alite/SoundManager.tsx` (Static utility class for managing sound playback)
[x] `src/de/phbouillon/android/games/alite/model/missions/MissionManager.tsx` (Singleton for managing all missions in the game)
[x] `src/com/google/android/vending/licensing/ILicensingService.tsx` (deprecated)
[x] `src/de/phbouillon/android/games/alite/model/Weight.tsx` (Value object for representing weight)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/space/curves/Curve.tsx` (Abstract base class for defining curved flight paths)
[x] `src/de/phbouillon/android/games/alite/ButtonRegistry.tsx` (Singleton for managing and processing touch events for all on-screen buttons)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/GameOverUpdater.tsx` (Manages the "game over" sequence)
[x] `src/de/phbouillon/android/framework/impl/AndroidInput.tsx`
[x] `src/de/phbouillon/android/games/alite/screens/canvas/LoadScreen.tsx` (Screen for loading a saved commander profile)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/sprites/CompassRenderer.tsx` (Renders the navigation compass on the HUD)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/space/curves/CurveParameter.tsx` (Calculates interpolated values for flight path curves)
[x] `src/de/phbouillon/android/games/alite/model/trading/TradeGoodStore.tsx` (Abstract singleton for managing all tradeable goods)
[x] `src/de/phbouillon/android/games/alite/screens/canvas/options/AudioOptionsScreen.tsx` (Screen for adjusting audio and vibration settings)
[x] `src/de/phbouillon/android/games/alite/screens/canvas/SaveScreen.tsx` (Screen for saving the player's commander profile)
[x] `src/de/phbouillon/android/framework/impl/gl/Box.tsx` (Creates vertex data for a 3D box and handles rendering)
[x] `src/de/phbouillon/android/games/alite/ScreenCodes.tsx` (Enum for identifying all game screens)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/sprites/buttons/EscapeCapsuleUpdater.tsx` (Manages the cinematic sequence for the escape capsule)
[x] `src/de/phbouillon/android/games/alite/model/missions/CougarMission.tsx` (Defines the Cougar mission, involving a timed enemy spawn and special cargo)
[x] `src/de/phbouillon/android/games/alite/model/missions/ThargoidDocumentsMission.tsx` (Defines the Thargoid Documents mission)
[x] `src/de/phbouillon/android/games/alite/ScrollPane.tsx` (UI component for a scrollable pane)
[x] `src/com/google/android/vending/expansion/downloader/impl/CustomIntentService.tsx` (deprecated)
[x] `test/de/phbouillon/android/games/alite/model/generator/SystemDataTest.tsx` (Tests for galaxy generation and system data)
[x] `src/de/phbouillon/android/games/alite/screens/canvas/DiskScreen.tsx` (Menu screen for load, save, and catalog options)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/Explosion.tsx` (Manages an explosion effect composed of multiple billboards)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/OnScreenMessage.tsx` (Manages the display of on-screen messages)
[x] `src/de/phbouillon/android/games/alite/model/library/Toc.tsx` (Parses the Table of Contents for the in-game library)
[x] `src/de/phbouillon/android/games/alite/model/missions/ConstrictorMission.tsx` (Defines the Constrictor mission)
[x] `src/de/phbouillon/android/games/alite/screens/canvas/missions/EndMissionScreen.tsx` (Screen for the final "Elite" mission)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/sprites/ControlPad.tsx` (A virtual joystick/control pad for ship control)
[x] `src/de/phbouillon/android/games/alite/model/trading/TradeGood.tsx` (Data class representing a tradeable commodity)
[x] `src/de/phbouillon/android/games/alite/screens/canvas/missions/ThargoidStationScreen.tsx` (Screen for the Thargoid Station mission)
[x] `src/de/phbouillon/android/games/alite/Assets.tsx` (Central static class for holding references to all game assets)
[x] `src/com/google/android/vending/expansion/downloader/SystemFacade.tsx` (deprecated)
[x] `src/de/phbouillon/android/framework/impl/AndroidMusic.tsx` (Android-specific music playback, stubbed for replacement with Web Audio)
[x] `src/de/phbouillon/android/games/alite/screens/canvas/LaserPositionSelectionScreen.tsx` (Screen for selecting a laser mounting position)
[x] `src/de/phbouillon/android/games/alite/model/trading/AliteTradeGoodStore.tsx` (Concrete implementation of TradeGoodStore, initializes all trade goods)
[x] `src/de/phbouillon/android/games/alite/screens/canvas/options/MoreDebugSettingsScreen.tsx` (A debug screen for managing missions)
[x] `test/de/phbouillon/android/games/alite/colors/ColorSchemeTest.tsx` (Tests for the ColorScheme class)
[x] `src/de/phbouillon/android/games/alite/screens/canvas/missions/CougarScreen.tsx` (Screen for the Cougar mission)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/AliteObject.tsx` (Base class for all renderable game objects)
[x] `src/com/google/android/vending/licensing/AESObfuscator.tsx` (deprecated)
[x] `src/de/phbouillon/android/framework/math/Vector3f.tsx` (Represents a 3D vector and provides vector math operations)
[ ] `src/de/phbouillon/android/games/alite/screens/opengl/objects/PlanetSpaceObject.tsx`
[ ] `src/de/phbouillon/android/games/alite/model/missions/SupernovaMission.tsx`
[ ] `src/de/phbouillon/android/games/alite/model/generator/InhabitantComputation.tsx`
[ ] `src/de/phbouillon/android/games/alite/colors/AliteColor.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/opengl/sprites/CursorKeys.tsx`
[ ] `src/de/phbouillon/android/framework/impl/AndroidPixmap.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/ObjectPicker.tsx`
[x] `src/com/google/android/vending/expansion/downloader/IDownloaderClient.tsx` (deprecated)
[ ] `src/de/phbouillon/android/games/alite/model/library/LibraryPage.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/canvas/HexNumberPadScreen.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/canvas/tutorial/TutorialLine.tsx`
[ ] `src/de/phbouillon/android/framework/impl/AlternativeAccelHandler.tsx`
[ ] `src/de/phbouillon/android/framework/impl/ColorFilterGenerator.tsx`
[x] `src/com/google/android/vending/expansion/downloader/DownloaderServiceMarshaller.tsx` (deprecated)
[ ] `src/de/phbouillon/android/games/alite/screens/canvas/tutorial/TutEquipment.tsx`
- [x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/StationSpaceObject.java` (File not found, skipped)
- [x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/space/ShipFactory.java` (File not found, skipped)
[ ] `src/de/phbouillon/android/games/alite/Slider.tsx`
[ ] `src/com/dd/plist/NSData.tsx`
[ ] `src/de/phbouillon/android/games/alite/io/ObbExpansionsManager.tsx`
[ ] `src/de/phbouillon/android/games/alite/model/Repository.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/canvas/missions/ThargoidDocumentsScreen.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/opengl/objects/Billboard.tsx`
[ ] `src/de/phbouillon/android/framework/impl/gl/Disk.tsx`
[ ] `src/de/phbouillon/android/games/alite/model/missions/ThargoidStationMission.tsx`
[ ] `src/de/phbouillon/android/framework/impl/AccelerometerHandler.tsx`
- [x] `src/de/phbouillon/android/games/alite/model/ship/ShipProperties.java` (File not found, skipped)
[ ] `src/de/phbouillon/android/games/alite/model/Equipment.tsx`
[ ] `src/com/dd/plist/NSDate.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/canvas/missions/SupernovaScreen.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/canvas/options/GameplayOptionsScreen.tsx`
[ ] `src/de/phbouillon/android/framework/impl/gl/Sprite.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/canvas/BuyScreen.tsx`
[ ] `src/de/phbouillon/android/framework/impl/gl/font/SpriteBatch.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/canvas/QuantityPadScreen.tsx`
[ ] `src/de/phbouillon/android/games/alite/AliteLog.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/canvas/options/ControlOptionsScreen.tsx`
[ ] `src/de/phbouillon/android/framework/impl/MultiTouchHandler.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/canvas/tutorial/TutIntroduction.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/opengl/HyperspaceScreen.tsx`
[x] `src/com/google/android/vending/licensing/LicenseValidator.tsx` (deprecated)
[ ] `src/de/phbouillon/android/games/alite/screens/canvas/tutorial/TutNavigation.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/canvas/missions/ConstrictorScreen.tsx`
[x] `src/com/google/android/vending/expansion/downloader/Constants.tsx` (deprecated)
[ ] `src/de/phbouillon/android/games/alite/screens/canvas/InventoryScreen.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/EngineExhaust.tsx`
[ ] `src/de/phbouillon/android/games/alite/model/missions/Mission.tsx`
[x] `src/com/google/android/vending/expansion/downloader/impl/DownloadNotification.tsx` (deprecated)
[ ] `src/de/phbouillon/android/games/alite/screens/canvas/LibraryScreen.tsx`
[x] `src/com/android/vending/expansion/zipfile/APEZProvider.tsx` (deprecated)
[ ] `test/de/phbouillon/android/games/alite/screens/opengl/ingame/InGameHelperTest.tsx`
[ ] `src/de/phbouillon/android/framework/impl/AndroidFileIO.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/DockingComputerAI.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/canvas/options/DisplayOptionsScreen.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/opengl/ControlledShipIntroScreen.tsx`
[ ] `src/de/phbouillon/android/framework/impl/PluginManagerImpl.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/canvas/tutorial/TutTrading.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/opengl/sprites/InfoGaugeRenderer.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/canvas/FatalExceptionScreen.tsx`
[ ] `src/com/dd/plist/NSString.tsx`
[ ] `src/de/phbouillon/android/games/alite/screens/canvas/TradeScreen.tsx`
[x] `src/com/google/android/vending/expansion/downloader/Helpers.tsx` (deprecated)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/TextureManager.tsx` File containing the TextureManager class
[x] `src/de/phbouillon/android/games/alite/screens/canvas/options/OptionsScreen.tsx` File containing the options screen
[x] `src/de/phbouillon/android/games/alite/screens/NavigationBar.tsx` File containing the NavigationBar class
[x] `src/de/phbouillon/android/games/alite/screens/canvas/ShipIntroScreen.tsx` File containing the ship intro screen
[x] `src/com/dd/plist/BinaryPropertyListWriter.tsx` File containing the BinaryPropertyListWriter class
[x] `src/de/phbouillon/android/games/alite/ScreenBuilder.tsx` File containing the ScreenBuilder class
[x] `src/de/phbouillon/android/framework/impl/gl/Cylinder.tsx` File containing the Cylinder class
[x] `src/de/phbouillon/android/framework/impl/AndroidGame.tsx` File containing the AndroidGame class
[x] `src/de/phbouillon/android/framework/math/Quaternion.tsx` File containing the Quaternion class
[x] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/ViewingTransformationHelper.tsx` File containing the ViewingTransformationHelper class
[x] `src/de/phbouillon/android/framework/impl/gl/Sphere.tsx` File containing the Sphere class
[x] `src/de/phbouillon/android/games/alite/screens/canvas/tutorial/TutorialScreen.tsx` File containing the TutorialScreen class
[x] `src/de/phbouillon/android/games/alite/screens/opengl/sprites/AliteHud.tsx` File containing the AliteHud class
[x] `src/de/phbouillon/android/games/alite/screens/opengl/AboutScreen.tsx` File containing the AboutScreen class
[x] `src/de/phbouillon/android/framework/PluginModel.tsx` File containing the PluginModel class
[x] `src/com/dd/plist/NSSet.tsx` File containing the NSSet class
[x] `src/de/phbouillon/android/games/alite/Settings.tsx`
[x] `src/de/phbouillon/android/games/alite/Button.tsx` File containing the Button class
[x] `src/de/phbouillon/android/games/alite/screens/canvas/ShipEditorScreen.tsx` File containing the ShipEditorScreen class
[x] `src/de/phbouillon/android/games/alite/screens/canvas/EquipmentScreen.tsx` File containing the EquipmentScreen class
[x] `src/com/dd/plist/NSArray.tsx` File containing the NSArray class
[x] `src/com/google/android/vending/expansion/downloader/DownloaderClientMarshaller.tsx` (deprecated)
[x] `src/de/phbouillon/android/games/alite/screens/canvas/CatalogScreen.tsx` File containing the CatalogScreen class
[x] `src/de/phbouillon/android/games/alite/AliteIntro.tsx` File containing the AliteIntro class
[x] `src/de/phbouillon/android/games/alite/screens/canvas/options/DebugSettingsScreen.tsx` File containing the DebugSettingsScreen class
[x] `src/de/phbouillon/android/games/alite/screens/canvas/PluginsScreen.tsx` File containing the PluginsScreen class
[x] `src/de/phbouillon/android/framework/impl/gl/GraphicObject.tsx` File containing the GraphicObject class
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/LaserCylinder.tsx` File containing the LaserCylinder class
[x] `src/de/phbouillon/android/games/alite/screens/canvas/StatusScreen.tsx` File containing the StatusScreen class
[x] `src/com/dd/plist/NSNumber.tsx` File containing the NSNumber class
[x] `src/de/phbouillon/android/games/alite/screens/canvas/options/InFlightButtonsOptionsScreen.tsx` File containing the InFlightButtonsOptionsScreen class
[x] `src/com/dd/plist/XMLPropertyListParser.tsx` File containing the XMLPropertyListParser class
[x] `src/com/google/android/vending/licensing/APKExpansionPolicy.tsx` (deprecated)
[x] `src/de/phbouillon/android/framework/impl/gl/font/GLText.tsx` File containing the GLText class
[x] `src/com/google/android/vending/licensing/LicenseChecker.tsx` (deprecated)
[x] `src/de/phbouillon/android/games/alite/screens/canvas/tutorial/TutHud.tsx` File containing the TutHud class
[x] `src/de/phbouillon/android/framework/impl/gl/font/Vertices.tsx` File containing the Vertices class
[x] `src/de/phbouillon/android/games/alite/model/generator/GalaxyGenerator.tsx` File containing the GalaxyGenerator class
[x] `src/com/android/vending/expansion/zipfile/ZipResourceFile.tsx` (deprecated)
[x] `src/com/dd/plist/NSDictionary.tsx` File containing the NSDictionary class
[x] `src/de/phbouillon/android/games/alite/screens/canvas/AchievementsScreen.tsx` File containing the AchievementsScreen class
[x] `src/com/dd/plist/NSObject.tsx` File containing the NSObject class
[x] `src/de/phbouillon/android/framework/impl/AndroidGraphics.tsx` File containing the AndroidGraphics class
[x] `src/de/phbouillon/android/games/alite/screens/canvas/GalaxyScreen.tsx` File containing the GalaxyScreen class
[x] `src/de/phbouillon/android/games/alite/model/PlayerCobra.tsx` File containing the PlayerCobra class
[x] `src/de/phbouillon/android/games/alite/screens/canvas/tutorial/TutAdvancedFlying.tsx` File containing the TutAdvancedFlying class
[x] `src/de/phbouillon/android/games/alite/AliteStartManager.tsx` File containing the AliteStartManager class
[x] `src/de/phbouillon/android/games/alite/model/generator/SystemData.tsx` File containing the SystemData class
[x] `src/com/google/android/vending/expansion/downloader/impl/DownloadsDB.tsx` (deprecated)
[x] `src/de/phbouillon/android/games/alite/screens/canvas/HackerScreen.tsx` File containing the HackerScreen class
[x] `src/de/phbouillon/android/games/alite/model/Medal.tsx` File containing the Medal class
[x] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/InGameHelper.tsx` File containing the InGameHelper class
[x] `src/de/phbouillon/android/games/alite/L.tsx` File containing the L class
[x] `src/com/dd/plist/PropertyListParser.tsx` File containing the PropertyListParser class
[x] `src/de/phbouillon/android/games/alite/Alite.tsx` File containing the Alite class
[x] `src/de/phbouillon/android/games/alite/screens/canvas/AliteScreen.tsx` File containing the AliteScreen class
[x] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/FlightScreen.tsx` File containing the FlightScreen class
[x] `src/de/phbouillon/android/games/alite/colors/ColorScheme.tsx` File containing the ColorScheme class
[x] `src/de/phbouillon/android/games/alite/screens/canvas/LibraryPageScreen.tsx` File containing the LibraryPageScreen class
[x] `src/com/dd/plist/BinaryPropertyListParser.tsx` File containing the BinaryPropertyListParser class
[x] `src/com/dd/plist/ASCIIPropertyListParser.tsx` File containing the ASCIIPropertyListParser class
[x] `src/com/google/android/vending/licensing/util/Base64.tsx` (deprecated)
[x] `src/de/phbouillon/android/games/alite/screens/canvas/tutorial/TutBasicFlying.tsx` File containing the TutBasicFlying class
[x] `src/de/phbouillon/android/games/alite/screens/canvas/PlanetScreen.tsx` File containing the PlanetScreen class
[x] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/LaserManager.tsx` File containing the LaserManager class
[x] `src/de/phbouillon/android/games/alite/screens/opengl/sprites/buttons/AliteButtons.tsx` File containing the AliteButtons class
[x] `src/de/phbouillon/android/games/alite/model/Player.tsx` File containing the Player class
[x] `src/de/phbouillon/android/games/alite/oxp/OXPParser.tsx` File containing the OXPParser class
[x] `src/com/google/android/vending/expansion/downloader/impl/DownloadThread.tsx` (deprecated)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/ObjectSpawnManager.tsx` File containing the ObjectSpawnManager class
[x] `src/de/phbouillon/android/games/alite/io/FileUtils.tsx` File containing the FileUtils class
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/space/SpaceObject.tsx` File containing the SpaceObject class
[x] `src/de/phbouillon/android/games/alite/screens/opengl/objects/space/SpaceObjectAI.tsx` (Handles the AI logic for space objects, including states like attacking, fleeing, and pathfinding. Also manages collision avoidance and responses to in-game events)
[x] `src/com/google/android/vending/expansion/downloader/impl/DownloaderService.tsx` (deprecated)
[x] `src/de/phbouillon/android/games/alite/screens/opengl/ingame/InGameManager.tsx` (Core manager for the main game loop, handling object updates, rendering, player input, and game state transitions. It orchestrates interactions between the player, NPCs, and the game world)
[x] `gen/de/phbouillon/android/games/alite/R.tsx` (Android generated resource file, not needed for PC port)
[x] `src/com/dd/plist/Base64.tsx` (Utility class for Base64 encoding and decoding)