# Conversion Plan

This document outlines the high-level plan for converting the Alite game from Java to TypeScript, based on the user's direct instructions.

## Core Principles

1.  **Sequential, One-Pass Conversion:** All files listed in this document will be converted one by one, in order. Each file will be fully converted in a single pass without pausing to handle dependencies.
2.  **No Dependency Chasing:** The conversion of one file will not be stopped to convert its dependencies. The logic will be written as if all other classes and methods already exist in TypeScript.
3.  **No Stubs or Deletions:** All Java logic within a file will be converted to TypeScript. No code will be deleted or replaced with placeholders/stubs.
4.  **No Testing or Compilation:** The sole focus is the direct translation of code logic. No tests will be run, and no attempt will be made to verify compilation. The user is responsible for all testing and debugging after the conversion phase is complete.

## Implementation Details & Assumptions

*   **Google Dependencies:** All Google Play and Android Vending dependencies are considered deprecated and will be removed if encountered.
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

[x] `gen\de\phbouillon\android\games\alite\BuildConfig.tsx` (skipped)
[x] `src\de\phbouillon\android\games\alite\screens\opengl\objects\space\AiStateCallback.tsx`
[x] `src\de\phbouillon\android\framework\TimeFactorChangeListener.tsx`
[x] `src\de\phbouillon\android\framework\IMethodHook.tsx`
[x] `src\de\phbouillon\android\framework\impl\IAccelerometerHandler.tsx`
[x] `src\de\phbouillon\android\framework\IntFunction.tsx`
[x] `src\de\phbouillon\android\framework\MemUtil.tsx`
[x] `src\de\phbouillon\android\framework\ResourceStream.tsx`
[x] `src\de\phbouillon\android\games\alite\screens\opengl\objects\space\AiStateCallbackHandler.tsx`
[x] `src\com\google\android\vending\licensing\util\Base64DecoderException.tsx` (deleted)
[x] `src\de\phbouillon\android\framework\Audio.tsx`
[x] `src\com\google\android\vending\licensing\ValidationException.tsx` (deleted)
[x] `src\de\phbouillon\android\framework\Game.tsx`
[x] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\ScoopCallback.tsx`
[x] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\SpaceObjectTraverser.tsx`
[x] `src\de\phbouillon\android\games\alite\Component.tsx`
[x] `src\de\phbouillon\android\games\alite\screens\opengl\objects\space\curves\ConstCurveParameter.tsx`
[x] `src\de\phbouillon\android\framework\Music.tsx`
[x] `src\de\phbouillon\android\games\alite\Loggable.tsx`
[x] `src\de\phbouillon\android\games\alite\screens\opengl\objects\space\WayPointFactory.tsx`
[x] `src\de\phbouillon\android\games\alite\screens\opengl\objects\space\AIMethod.tsx`
[x] `src\com\google\android\vending\licensing\NullDeviceLimiter.tsx` (deleted)
[x] `src\de\phbouillon\android\games\alite\screens\opengl\objects\space\curves\CurveParameterKey.tsx`
[x] `src\de\phbouillon\android\games\alite\screens\canvas\TextData.tsx`
[x] `src\de\phbouillon\android\games\alite\model\LegalStatus.tsx`
[x] `src\de\phbouillon\android\framework\impl\TouchHandler.tsx`
[x] `src\de\phbouillon\android\framework\Sound.tsx`
[x] `src\de\phbouillon\android\framework\PluginManager.tsx`
[x] `src\de\phbouillon\android\games\alite\model\Unit.tsx`
[x] `src\de\phbouillon\android\framework\Pixmap.tsx`
[x] `src\de\phbouillon\android\framework\Graphics.tsx`
[x] `src\de\phbouillon\android\framework\Rect.tsx`
[x] `src\de\phbouillon\android\framework\Texture.tsx`
[x] `src\de\phbouillon\android\framework\SpriteData.tsx`
[x] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\DepthBucket.tsx`
[x] `src\de\phbouillon\android\games\alite\screens\opengl\objects\AliteObject.tsx`
[x] `src\de\phbouillon\android\framework\impl\gl\GraphicObject.tsx`
[x] `src\de\phbouillon\android\games\alite\model\library\TocEntry.tsx`
[x] `src\de\phbouillon\android\games\alite\model\library\LibraryPage.tsx`
[x] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\ObjectType.tsx`
[x] `src\de\phbouillon\android\games\alite\model\library\ItemDescriptor.tsx`
[x] `src\de\phbouillon\android\games\alite\screens\opengl\objects\TargetBoxSpaceObject.tsx`
[x] `src\de\phbouillon\android\framework\impl\gl\TargetBox.tsx`
[x] `src\de\phbouillon\android\games\alite\io\AliteAlarmReceiver.tsx` (deleted)
[x] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\AttackTraverser.tsx`
[x] `src\de\phbouillon\android\games\alite\screens\opengl\objects\space\SpaceObject.tsx`
[x] `src\de\phbouillon\android\games\alite\model\Condition.tsx`
[x] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\CloakingEvent.tsx`
[x] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\TimedEvent.tsx`
[x] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\InGameManager.tsx`
[x] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\OnScreenMessage.tsx`
[x] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\JammingEvent.tsx`
[x] `src\de\phbouillon\android\framework\impl\gl\font\CharacterData.tsx`
[x] `src\com\google\android\vending\expansion\downloader\IStub.tsx` (deleted)
[x] `src\de\phbouillon\android\games\alite\screens\opengl\objects\DiskSpaceObject.tsx`
[x] `src\de\phbouillon\android\games\alite\screens\opengl\sprites\buttons\ButtonGroup.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\trading\AliteMarket.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\objects\CylinderSpaceObject.tsx`
[ ] `src\de\phbouillon\android\framework\Screen.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\objects\SkySphereSpaceObject.tsx`
[ ] `test\de\phbouillon\android\games\alite\TestLogger.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\sprites\buttons\EnergyBombTraverser.tsx`
[ ] `src\de\phbouillon\android\games\alite\ShipControl.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\generator\SeedType.tsx`
[ ] `src\de\phbouillon\android\games\alite\AliteConfig.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\generator\enums\Government.tsx`
[ ] `src\com\dd\plist\PropertyListFormatException.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\LocalScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\objects\SphericalSpaceObject.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\missions\EndMission.tsx`
[ ] `test\de\phbouillon\android\framework\TestInput.tsx`
[ ] `src\de\phbouillon\android\games\alite\io\AliteDownloaderService.tsx`
[ ] `test\de\phbouillon\android\games\alite\screens\opengl\TestTexture.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\Rating.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\sprites\buttons\ButtonData.tsx`
[ ] `src\com\google\android\vending\licensing\Obfuscator.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\CommanderData.tsx`
[ ] `src\de\phbouillon\android\framework\GlScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\oxp\PListParser.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\missions\MissionLine.tsx`
[ ] `src\com\google\android\vending\licensing\DeviceLimiter.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\objects\ExplosionBillboard.tsx`
[ ] `src\com\google\android\vending\licensing\Policy.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\HyperspaceTimer.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\objects\BoxSpaceObject.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\sprites\buttons\TorusBlockingTraverser.tsx`
[ ] `src\de\phbouillon\android\framework\impl\Pool.tsx`
[ ] `src\de\phbouillon\android\framework\impl\AndroidSound.tsx`
[ ] `src\de\phbouillon\android\framework\FileIO.tsx`
[ ] `src\de\phbouillon\android\framework\Input.tsx`
[ ] `src\de\phbouillon\android\framework\impl\PulsingHighlighter.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\sprites\buttons\ECMTraverser.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\generator\enums\Economy.tsx`
[ ] `test\de\phbouillon\android\games\alite\screens\opengl\objects\space\SpaceObjectTest.tsx`
[ ] `src\de\phbouillon\android\framework\impl\gl\Skysphere.tsx`
[ ] `src\de\phbouillon\android\framework\Plugin.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\objects\LaserBillboard.tsx`
[ ] `src\com\google\android\vending\licensing\PreferenceObfuscator.tsx`
[ ] `src\com\google\android\vending\licensing\ResponseData.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\ScrollingText.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\TimedEvent.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\objects\space\MathHelper.tsx`
[ ] `src\de\phbouillon\android\framework\impl\gl\GlUtils.tsx`
[ ] `src\com\google\android\vending\licensing\LicenseCheckerCallback.tsx`
[ ] `src\de\phbouillon\android\framework\Language.tsx`
[ ] `src\com\google\android\vending\expansion\downloader\DownloadProgressInfo.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\InventoryItem.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\generator\StringUtil.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\trading\Market.tsx`
[ ] `src\de\phbouillon\android\framework\Timer.tsx`
[ ] `src\com\android\vending\expansion\zipfile\APKExpansionSupport.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\QuitScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\objects\space\curves\BreakUp.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\objects\space\curves\BreakDown.tsx`
[ ] `src\com\google\android\vending\expansion\downloader\IDownloaderService.tsx`
[ ] `src\com\dd\plist\UID.tsx`
[ ] `src\com\google\android\vending\expansion\downloader\impl\DownloadInfo.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\objects\space\WayPoint.tsx`
[ ] `test\de\phbouillon\android\framework\TestFileIO.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\WitchSpaceRender.tsx`
[ ] `src\de\phbouillon\android\framework\impl\AndroidAudio.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\sprites\ShipController.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\EquipmentStore.tsx`
[ ] `src\de\phbouillon\android\games\alite\io\AliteFiles.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\tutorial\TutorialSelectionScreen.tsx`
[ ] `src\com\google\android\vending\licensing\ILicenseResultListener.tsx`
[ ] `src\de\phbouillon\android\framework\impl\gl\TargetBox.tsx`
[ ] `src\de\phbouillon\android\games\alite\SoundManager.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\missions\MissionManager.tsx`
[ ] `src\com\google\android\vending\licensing\ILicensingService.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\Weight.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\objects\space\curves\Curve.tsx`
[ ] `src\de\phbouillon\android\games\alite\ButtonRegistry.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\GameOverUpdater.tsx`
[ ] `src\de\phbouillon\android\framework\impl\AndroidInput.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\LoadScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\sprites\CompassRenderer.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\objects\space\curves\CurveParameter.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\trading\TradeGoodStore.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\options\AudioOptionsScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\SaveScreen.tsx`
[ ] `src\de\phbouillon\android\framework\impl\gl\Box.tsx`
[ ] `src\de\phbouillon\android\games\alite\ScreenCodes.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\sprites\buttons\EscapeCapsuleUpdater.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\missions\CougarMission.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\missions\ThargoidDocumentsMission.tsx`
[ ] `src\de\phbouillon\android\games\alite\ScrollPane.tsx`
[ ] `src\com\google\android\vending\expansion\downloader\impl\CustomIntentService.tsx`
[ ] `test\de\phbouillon\android\games\alite\model\generator\SystemDataTest.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\DiskScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\objects\Explosion.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\OnScreenMessage.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\library\Toc.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\missions\ConstrictorMission.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\missions\EndMissionScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\sprites\ControlPad.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\trading\TradeGood.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\missions\ThargoidStationScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\Assets.tsx`
[ ] `src\com\google\android\vending\expansion\downloader\SystemFacade.tsx`
[ ] `src\de\phbouillon\android\framework\impl\AndroidMusic.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\LaserPositionSelectionScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\trading\AliteTradeGoodStore.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\options\MoreDebugSettingsScreen.tsx`
[ ] `test\de\phbouillon\android\games\alite\colors\ColorSchemeTest.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\missions\CougarScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\objects\AliteObject.tsx`
[ ] `src\com\google\android\vending\licensing\AESObfuscator.tsx`
[ ] `src\de\phbouillon\android\framework\math\Vector3f.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\objects\PlanetSpaceObject.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\missions\SupernovaMission.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\generator\InhabitantComputation.tsx`
[ ] `src\de\phbouillon\android\games\alite\colors\AliteColor.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\sprites\CursorKeys.tsx`
[ ] `src\de\phbouillon\android\framework\impl\AndroidPixmap.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\ObjectPicker.tsx`
[ ] `src\com\google\android\vending\expansion\downloader\IDownloaderClient.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\library\LibraryPage.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\HexNumberPadScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\tutorial\TutorialLine.tsx`
[ ] `src\de\phbouillon\android\framework\impl\AlternativeAccelHandler.tsx`
[ ] `src\de\phbouillon\android\framework\impl\ColorFilterGenerator.tsx`
[ ] `src\com\google\android\vending\expansion\downloader\DownloaderServiceMarshaller.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\tutorial\TutEquipment.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\LoadingScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\objects\space\SpaceObjectFactory.tsx`
[ ] `src\de\phbouillon\android\games\alite\Slider.tsx`
[ ] `src\com\dd\plist\NSData.tsx`
[ ] `src\de\phbouillon\android\games\alite\io\ObbExpansionsManager.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\Repository.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\missions\ThargoidDocumentsScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\objects\Billboard.tsx`
[ ] `src\de\phbouillon\android\framework\impl\gl\Disk.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\missions\ThargoidStationMission.tsx`
[ ] `src\de\phbouillon\android\framework\impl\AccelerometerHandler.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\StarDust.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\Equipment.tsx`
[ ] `src\com\dd\plist\NSDate.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\missions\SupernovaScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\options\GameplayOptionsScreen.tsx`
[ ] `src\de\phbouillon\android\framework\impl\gl\Sprite.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\BuyScreen.tsx`
[ ] `src\de\phbouillon\android\framework\impl\gl\font\SpriteBatch.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\QuantityPadScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\AliteLog.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\options\ControlOptionsScreen.tsx`
[ ] `src\de\phbouillon\android\framework\impl\MultiTouchHandler.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\tutorial\TutIntroduction.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\HyperspaceScreen.tsx`
[ ] `src\com\google\android\vending\licensing\LicenseValidator.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\tutorial\TutNavigation.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\missions\ConstrictorScreen.tsx`
[ ] `src\com\google\android\vending\expansion\downloader\Constants.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\InventoryScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\EngineExhaust.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\missions\Mission.tsx`
[ ] `src\com\google\android\vending\expansion\downloader\impl\DownloadNotification.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\LibraryScreen.tsx`
[ ] `src\com\android\vending\expansion\zipfile\APEZProvider.tsx`
[ ] `test\de\phbouillon\android\games\alite\screens\opengl\ingame\InGameHelperTest.tsx`
[ ] `src\de\phbouillon\android\framework\impl\AndroidFileIO.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\DockingComputerAI.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\options\DisplayOptionsScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\ControlledShipIntroScreen.tsx`
[ ] `src\de\phbouillon\android\framework\impl\PluginManagerImpl.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\tutorial\TutTrading.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\sprites\InfoGaugeRenderer.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\FatalExceptionScreen.tsx`
[ ] `src\com\dd\plist\NSString.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\TradeScreen.tsx`
[ ] `src\com\google\android\vending\expansion\downloader\Helpers.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\TextureManager.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\options\OptionsScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\NavigationBar.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\ShipIntroScreen.tsx`
[ ] `src\com\dd\plist\BinaryPropertyListWriter.tsx`
[ ] `src\de\phbouillon\android\games\alite\ScreenBuilder.tsx`
[ ] `src\de\phbouillon\android\framework\impl\gl\Cylinder.tsx`
[ ] `src\de\phbouillon\android\framework\impl\AndroidGame.tsx`
[ ] `src\de\phbouillon\android\framework\math\Quaternion.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\ViewingTransformationHelper.tsx`
[ ] `src\de\phbouillon\android\framework\impl\gl\Sphere.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\tutorial\TutorialScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\sprites\AliteHud.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\AboutScreen.tsx`
[ ] `src\de\phbouillon\android\framework\PluginModel.tsx`
[ ] `src\com\dd\plist\NSSet.tsx`
[ ] `src\de\phbouillon\android\games\alite\Settings.tsx`
[ ] `src\de\phbouillon\android\games\alite\Button.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\ShipEditorScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\EquipmentScreen.tsx`
[ ] `src\com\dd\plist\NSArray.tsx`
[ ] `src\com\google\android\vending\expansion\downloader\DownloaderClientMarshaller.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\CatalogScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\AliteIntro.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\options\DebugSettingsScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\PluginsScreen.tsx`
[ ] `src\de\phbouillon\android\framework\impl\gl\GraphicObject.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\objects\LaserCylinder.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\StatusScreen.tsx`
[ ] `src\com\dd\plist\NSNumber.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\options\InFlightButtonsOptionsScreen.tsx`
[ ] `src\com\dd\plist\XMLPropertyListParser.tsx`
[ ] `src\com\google\android\vending\licensing\APKExpansionPolicy.tsx`
[ ] `src\de\phbouillon\android\framework\impl\gl\font\GLText.tsx`
[ ] `src\com\google\android\vending\licensing\LicenseChecker.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\tutorial\TutHud.tsx`
[ ] `src\de\phbouillon\android\framework\impl\gl\font\Vertices.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\generator\GalaxyGenerator.tsx`
[ ] `src\com\android\vending\expansion\zipfile\ZipResourceFile.tsx`
[ ] `src\com\dd\plist\NSDictionary.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\AchievementsScreen.tsx`
[ ] `src\com\dd\plist\NSObject.tsx`
[ ] `src\de\phbouillon\android\framework\impl\AndroidGraphics.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\GalaxyScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\PlayerCobra.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\tutorial\TutAdvancedFlying.tsx`
[ ] `src\de\phbouillon\android\games\alite\AliteStartManager.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\generator\SystemData.tsx`
[ ] `src\com\google\android\vending\expansion\downloader\impl\DownloadsDB.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\HackerScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\Medal.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\InGameHelper.tsx`
[ ] `src\de\phbouillon\android\games\alite\L.tsx`
[ ] `src\com\dd\plist\PropertyListParser.tsx`
[ ] `src\de\phbouillon\android\games\alite\Alite.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\AliteScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\FlightScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\colors\ColorScheme.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\LibraryPageScreen.tsx`
[ ] `src\com\dd\plist\BinaryPropertyListParser.tsx`
[ ] `src\com\dd\plist\ASCIIPropertyListParser.tsx`
[ ] `src\com\google\android\vending\licensing\util\Base64.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\tutorial\TutBasicFlying.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\canvas\PlanetScreen.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\LaserManager.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\sprites\buttons\AliteButtons.tsx`
[ ] `src\de\phbouillon\android\games\alite\model\Player.tsx`
[ ] `src\de\phbouillon\android\games\alite\oxp\OXPParser.tsx`
[ ] `src\com\google\android\vending\expansion\downloader\impl\DownloadThread.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\ObjectSpawnManager.tsx`
[ ] `src\de\phbouillon\android\games\alite\io\FileUtils.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\objects\space\SpaceObject.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\objects\space\SpaceObjectAI.tsx`
[ ] `src\com\google\android\vending\expansion\downloader\impl\DownloaderService.tsx`
[ ] `src\de\phbouillon\android\games\alite\screens\opengl\ingame\InGameManager.tsx`
[ ] `gen\de\phbouillon\android\games\alite\R.tsx`
[ ] `src\com\dd\plist\Base64.tsx`
