/* Alite - Discover the Universe on your Favorite Android Device
 * Copyright (C) 2015 Philipp Bouillon
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful and
 * fun, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see
 * http://http://www.gnu.org/licenses/gpl-3.0.txt.
 */

export class AliteConfig {
    // This was related to Android's OBB extension file system, not applicable to PC port.
    public static readonly HAS_EXTENSION_APK = false;
    public static readonly EXTENSION_FILE_LENGTH = 200693825;

    public static readonly GAME_NAME = "Alite 2020";
    // BuildConfig is an Android-specific generated file. Using a placeholder version.
    public static readonly VERSION_STRING = "1.0.0 PC";
    public static readonly ALITE_WEBSITE = "https://alite2020.iftopic.com";
    public static readonly ALITE_MAIL = "alite.crash.report@gmail.com";
    public static readonly ROOT_DRIVE_FOLDER = "1OtXzUbeHWrvN9j_JolgIMKEODHSQCmEK";

    public static readonly SCREEN_WIDTH = 1920;
    public static readonly SCREEN_HEIGHT = 1080;
    public static readonly NAVIGATION_BAR_SIZE = 200;
    public static readonly DESKTOP_WIDTH = AliteConfig.SCREEN_WIDTH - AliteConfig.NAVIGATION_BAR_SIZE;

    // This was an Android resource ID (R.raw.alite_intro_b1920)
    public static readonly ALITE_INTRO_B1920 = -1;
}
