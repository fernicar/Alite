/**
 * plist - An open source library to parse and generate property lists
 *
 * Copyright (C) 2012 Daniel Dreibrodt
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, to a particular purpose and NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * <p>Encodes and decodes to and from Base64 notation.</p>
 * <p>Homepage: <a href="http://iharder.net/base64">http://iharder.net/base64</a>.</p>
 *
 * <p>Example:</p>
 *
 * <code>const encoded = Base64.encode( myByteArray );</code>
 *
 * <code>const myByteArray = Base64.decode( encoded );</code>
 *
 * <p>The <tt>options</tt> parameter, which appears in a few places, is used to pass
 * several pieces of information to the encoder. In the "higher level" methods such as
 * encodeBytes( bytes, options ) the options parameter can be used to indicate such
 * things as first gzipping the bytes before encoding them, not inserting linefeeds,
 * and encoding using the URL-safe and Ordered dialects.</p>
 *
 * <p>Note, according to <a href="http://www.faqs.org/rfcs/rfc3548.html">RFC3548</a>,
 * Section 2.1, implementations should not add line feeds unless explicitly told
 * to do so. I've got Base64 set to this behavior now, although earlier versions
 * broke lines by default.</p>
 *
 * <p>The constants defined in Base64 can be OR-ed together to combine options, so you
 * might make a call like this:</p>
 *
 * <code>const encoded = Base64.encodeBytes( mybytes, Base64.GZIP | Base64.DO_BREAK_LINES );</code>
 * <p>to compress the data before encoding it and then making the output have newline characters.</p>
 * <p>Also...</p>
 * <code>const encoded = Base64.encodeBytes( crazyString.getBytes() );</code>
 *
 *
 *
 * <p>
 * Change Log:
 * </p>
 *
 * <ul>
 * <li>v2.3.7 - Fixed subtle bug when base 64 input stream contained the
 * value 01111111, which is an invalid base 64 character but should not
 * throw an ArrayIndexOutOfBoundsException either. Led to discovery of
 * mishandling (or potential for better handling) of other bad input
 * characters. You should now get an IOException if you try decoding
 * something that has bad characters in it.</li>
 * <li>v2.3.6 - Fixed bug when breaking lines and the final byte of the encoded
 * string ended in the last column; the buffer was not properly shrunk and
 * contained an extra (null) byte that made it into the string.</li>
 * <li>v2.3.5 - Fixed bug in {@link #encodeFromFile} where estimated buffer size
 * was wrong for files of size 31, 34, and 37 bytes.</li>
 * <li>v2.3.4 - Fixed bug when working with gzipped streams whereby flushing
 * the Base64.B64OutputStream closed the Base64 encoding (by padding with equals
 * signs) too soon. Also added an option to suppress the automatic decoding
 * of gzipped streams. Also added experimental support for specifying a
 * class loader when using the
 * {@link #decodeToObject(java.lang.String, int, java.lang.ClassLoader)}
 * method.</li>
 * <li>v2.3.3 - Changed default char encoding to US-ASCII which reduces the internal Java
 * footprint with its CharEncoders and so forth. Fixed some javadocs that were
 * inconsistent. Removed imports and specified things like java.io.IOException
 * explicitly inline.</li>
 * <li>v2.3.2 - Reduced memory footprint! Finally refined the "guessing" of how big the
 * final encoded data will be so that the code doesn't have to create two output
 * arrays: an oversized initial one and then a final, exact-sized one. Big win
 * when using the {@link #encodeBytesToBytes(byte[])} family of methods (and not
 * using the gzip options which uses a different mechanism with streams and stuff).</li>
 * <li>v2.3.1 - Added {@link #encodeBytesToBytes(byte[], int, int, int)} and some
 * similar helper methods to be more efficient with memory by not returning a
 * String but just a byte array.</li>
 * <li>v2.3 - <strong>This is not a drop-in replacement!</strong> This is two years of comments
 * and bug fixes queued up and finally executed. Thanks to everyone who sent
 * me stuff, and I'm sorry I wasn't able to distribute your fixes to everyone else.
 * Much bad coding was cleaned up including throwing exceptions where necessary
 * instead of returning null values or something similar. Here are some changes
 * that may affect you:
 * <ul>
 * <li><em>Does not break lines, by default.</em> This is to keep in compliance with
 * <a href="http://www.faqs.org/rfcs/rfc3548.html">RFC3548</a>.</li>
 * <li><em>Throws exceptions instead of returning null values.</em> Because some operations
 * (especially those that may permit the GZIP option) use IO streams, there
 * is a possiblity of an java.io.IOException being thrown. After some discussion and
 * thought, I've changed the behavior of the methods to throw java.io.IOExceptions
 * rather than return null if ever there's an error. I think this is more
 * appropriate, though it will require some changes to your code. Sorry,
 * it should have been done this way to begin with.</li>
 * <li><em>Removed all references to System.out, System.err, and the like.</em>
 * Shame on me. All I can say is sorry they were ever there.</li>
 * <li><em>Throws NullPointerExceptions and IllegalArgumentExceptions</em> as needed
 * such as when passed arrays are null or offsets are invalid.</li>
 * <li>Cleaned up as much javadoc as I could to avoid any javadoc warnings.
 * This was especially annoying before for people who were thorough in their
 * own projects and then had gobs of javadoc warnings on this file.</li>
 * </ul>
 * <li>v2.2.1 - Fixed bug using URL_SAFE and ORDERED encodings. Fixed bug
 * when using very small files (~&lt; 40 bytes).</li>
 * <li>v2.2 - Added some helper methods for encoding/decoding directly from
 * one file to the next. Also added a main() method to support command line
 * encoding/decoding from one file to the next. Also added these Base64 dialects:
 * <ol>
 * <li>The default is RFC3548 format.</li>
 * <li>Calling Base64.setFormat(Base64.BASE64_FORMAT.URLSAFE_FORMAT) generates
 * URL and file name friendly format as described in Section 4 of RFC3548.
 * http://www.faqs.org/rfcs/rfc3548.html</li>
 * <li>Calling Base64.setFormat(Base64.BASE64_FORMAT.ORDERED_FORMAT) generates
 * URL and file name friendly format that preserves lexical ordering as described
 * in http://www.faqs.org/qa/rfcc-1940.html</li>
 * </ol>
 * Special thanks to Jim Kellerman at <a href="http://www.powerset.com/">http://www.powerset.com/</a>
 * for contributing the new Base64 dialects.
 * </li>
 *
 * <li>v2.1 - Cleaned up javadoc comments and unused variables and methods. Added
 * some convenience methods for reading and writing to and from files.</li>
 * <li>v2.0.2 - Now specifies UTF-8 encoding in places where the code fails on systems
 * with other encodings (like EBCDIC).</li>
 * <li>v2.0.1 - Fixed an error when decoding a single byte, that is, when the
 * encoded data was a single byte.</li>
 * <li>v2.0 - I got rid of methods that used booleans to set options.
 * Now everything is more consolidated and cleaner. The code now detects
 * when data that's being decoded is gzip-compressed and will decompress it
 * automatically. Generally things are cleaner. You'll probably have to
 * change some method calls that you were making to support the new
 * options format (<tt>int</tt>s that you "OR" together).</li>
 * <li>v1.5.1 - Fixed bug when decompressing and decoding to a
 * byte[] using <tt>decode( String s, boolean gzipCompressed )</tt>.
 * Added the ability to "suspend" encoding in the Output Stream so
 * you can turn on and off the encoding if you need to embed base64
 * data in an otherwise "normal" stream (like an XML file).</li>
 * <li>v1.5 - Output stream pases on flush() command but doesn't do anything itself.
 * This helps when using GZIP streams.
 * Added the ability to GZip-compress objects before encoding them.</li>
 * <li>v1.4 - Added helper methods to read/write files.</li>
 * <li>v1.3.6 - Fixed B64OutputStream.flush() so that 'position' is reset.</li>
 * <li>v1.3.5 - Added flag to turn on and off line breaks. Fixed bug in input stream
 * where last buffer being read, if not completely full, was not returned.</li>
 * <li>v1.3.4 - Fixed when "improperly padded stream" error was thrown at the wrong time.</li>
 * <li>v1.3.3 - Fixed I/O streams which were totally messed up.</li>
 * </ul>
 *
 * <p>
 * I am placing this code in the Public Domain. Do with it as you will.
 * This software comes with no guarantees or warranties but with
 * plenty of well-wishing instead!
 * Please visit <a href="http://iharder.net/base64">http://iharder.net/base64</a>
 * periodically to check for updates or to contribute improvements.
 * </p>
 *
 * @author Robert Harder
 * @author rob@iharder.net
 * @version 2.3.7
 */
export class Base64 {

    /* ********  P U B L I C   F I E L D S  ******** */


    /**
     * No options specified. Value is zero.
     */
    public static readonly NO_OPTIONS = 0;

    /**
     * Specify encoding in first bit. Value is one.
     */
    public static readonly ENCODE = 1;


    /**
     * Specify decoding in first bit. Value is zero.
     */
    public static readonly DECODE = 0;


    /**
     * Specify that data should be gzip-compressed in second bit. Value is two.
     */
    public static readonly GZIP = 2;

    /**
     * Specify that gzipped data should <em>not</em> be automatically gunzipped.
     */
    public static readonly DONT_GUNZIP = 4;


    /**
     * Do break lines when encoding. Value is 8.
     */
    public static readonly DO_BREAK_LINES = 8;

    /**
     * Encode using Base64-like encoding that is URL- and Filename-safe as described
     * in Section 4 of RFC3548:
     * <a href="http://www.faqs.org/rfcs/rfc3548.html">http://www.faqs.org/rfcs/rfc3548.html</a>.
     * It is important to note that data encoded this way is <em>not</em> officially valid Base64,
     * or at the very least should not be called Base64 without also specifying that is
     * was encoded using the URL- and Filename-safe dialect.
     */
    public static readonly URL_SAFE = 16;


    /**
     * Encode using the special "ordered" dialect of Base64 described here:
     * <a href="http://www.faqs.org/qa/rfcc-1940.html">http://www.faqs.org/qa/rfcc-1940.html</a>.
     */
    public static readonly ORDERED = 32;


    /* ********  P R I V A T E   F I E L D S  ******** */


    /**
     * Maximum line length (76) of Base64 output.
     */
    private static readonly MAX_LINE_LENGTH = 76;


    /**
     * The equals sign (=) as a byte.
     */
    private static readonly EQUALS_SIGN = '='.charCodeAt(0);


    /**
     * The new line character (\n) as a byte.
     */
    private static readonly NEW_LINE = '\n'.charCodeAt(0);


    /**
     * Preferred encoding.
     */
    private static readonly PREFERRED_ENCODING = "US-ASCII";


    private static readonly WHITE_SPACE_ENC = -5; // Indicates white space in encoding
    private static readonly EQUALS_SIGN_ENC = -1; // Indicates equals sign in encoding


    /* ********  S T A N D A R D   B A S E 6 4   A L P H A B E T  ******** */

    /**
     * The 64 valid Base64 values.
     */
    /* Host platform me be something funny like EBCDIC, so we hardcode these values. */
    private static readonly _STANDARD_ALPHABET = [
        'A'.charCodeAt(0), 'B'.charCodeAt(0), 'C'.charCodeAt(0), 'D'.charCodeAt(0), 'E'.charCodeAt(0), 'F'.charCodeAt(0), 'G'.charCodeAt(0),
        'H'.charCodeAt(0), 'I'.charCodeAt(0), 'J'.charCodeAt(0), 'K'.charCodeAt(0), 'L'.charCodeAt(0), 'M'.charCodeAt(0), 'N'.charCodeAt(0),
        'O'.charCodeAt(0), 'P'.charCodeAt(0), 'Q'.charCodeAt(0), 'R'.charCodeAt(0), 'S'.charCodeAt(0), 'T'.charCodeAt(0), 'U'.charCodeAt(0),
        'V'.charCodeAt(0), 'W'.charCodeAt(0), 'X'.charCodeAt(0), 'Y'.charCodeAt(0), 'Z'.charCodeAt(0),
        'a'.charCodeAt(0), 'b'.charCodeAt(0), 'c'.charCodeAt(0), 'd'.charCodeAt(0), 'e'.charCodeAt(0), 'f'.charCodeAt(0), 'g'.charCodeAt(0),
        'h'.charCodeAt(0), 'i'.charCodeAt(0), 'j'.charCodeAt(0), 'k'.charCodeAt(0), 'l'.charCodeAt(0), 'm'.charCodeAt(0), 'n'.charCodeAt(0),
        'o'.charCodeAt(0), 'p'.charCodeAt(0), 'q'.charCodeAt(0), 'r'.charCodeAt(0), 's'.charCodeAt(0), 't'.charCodeAt(0), 'u'.charCodeAt(0),
        'v'.charCodeAt(0), 'w'.charCodeAt(0), 'x'.charCodeAt(0), 'y'.charCodeAt(0), 'z'.charCodeAt(0),
        '0'.charCodeAt(0), '1'.charCodeAt(0), '2'.charCodeAt(0), '3'.charCodeAt(0), '4'.charCodeAt(0), '5'.charCodeAt(0),
        '6'.charCodeAt(0), '7'.charCodeAt(0), '8'.charCodeAt(0), '9'.charCodeAt(0), '+'.charCodeAt(0), '/'.charCodeAt(0)
    ];


    /**
     * Translates a Base64 value to either its 6-bit reconstruction value
     * or a negative number indicating some other meaning.
     */
    private static readonly _STANDARD_DECODABET = [
        -9, -9, -9, -9, -9, -9, -9, -9, -9,                 // Decimal  0 -  8
        -5, -5,                                      // Whitespace: Tab and Linefeed
        -9, -9,                                      // Decimal 11 - 12
        -5,                                         // Whitespace: Carriage Return
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 14 - 26
        -9, -9, -9, -9, -9,                             // Decimal 27 - 31
        -5,                                         // Whitespace: Space
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,              // Decimal 33 - 42
        62,                                         // Plus sign at decimal 43
        -9, -9, -9,                                   // Decimal 44 - 46
        63,                                         // Slash at decimal 47
        52, 53, 54, 55, 56, 57, 58, 59, 60, 61,              // Numbers zero through nine
        -9, -9, -9,                                   // Decimal 58 - 60
        -1,                                         // Equals sign at decimal 61
        -9, -9, -9,                                      // Decimal 62 - 64
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,            // Letters 'A' through 'N'
        14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,        // Letters 'O' through 'Z'
        -9, -9, -9, -9, -9, -9,                          // Decimal 91 - 96
        26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,     // Letters 'a' through 'm'
        39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,     // Letters 'n' through 'z'
        -9, -9, -9, -9, -9                              // Decimal 123 - 127
        , -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,       // Decimal 128 - 139
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 140 - 152
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 153 - 165
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 166 - 178
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 179 - 191
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 192 - 204
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 205 - 217
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 218 - 230
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 231 - 243
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9         // Decimal 244 - 255
    ];


    /* ********  U R L   S A F E   B A S E 6 4   A L P H A B E T  ******** */

    /**
     * Used in the URL- and Filename-safe dialect described in Section 4 of RFC3548:
     * <a href="http://www.faqs.org/rfcs/rfc3548.html">http://www.faqs.org/rfcs/rfc3548.html</a>.
     * Notice that the last two bytes become "hyphen" and "underscore" instead of "plus" and "slash."
     */
    private static readonly _URL_SAFE_ALPHABET = [
        'A'.charCodeAt(0), 'B'.charCodeAt(0), 'C'.charCodeAt(0), 'D'.charCodeAt(0), 'E'.charCodeAt(0), 'F'.charCodeAt(0), 'G'.charCodeAt(0),
        'H'.charCodeAt(0), 'I'.charCodeAt(0), 'J'.charCodeAt(0), 'K'.charCodeAt(0), 'L'.charCodeAt(0), 'M'.charCodeAt(0), 'N'.charCodeAt(0),
        'O'.charCodeAt(0), 'P'.charCodeAt(0), 'Q'.charCodeAt(0), 'R'.charCodeAt(0), 'S'.charCodeAt(0), 'T'.charCodeAt(0), 'U'.charCodeAt(0),
        'V'.charCodeAt(0), 'W'.charCodeAt(0), 'X'.charCodeAt(0), 'Y'.charCodeAt(0), 'Z'.charCodeAt(0),
        'a'.charCodeAt(0), 'b'.charCodeAt(0), 'c'.charCodeAt(0), 'd'.charCodeAt(0), 'e'.charCodeAt(0), 'f'.charCodeAt(0), 'g'.charCodeAt(0),
        'h'.charCodeAt(0), 'i'.charCodeAt(0), 'j'.charCodeAt(0), 'k'.charCodeAt(0), 'l'.charCodeAt(0), 'm'.charCodeAt(0), 'n'.charCodeAt(0),
        'o'.charCodeAt(0), 'p'.charCodeAt(0), 'q'.charCodeAt(0), 'r'.charCodeAt(0), 's'.charCodeAt(0), 't'.charCodeAt(0), 'u'.charCodeAt(0),
        'v'.charCodeAt(0), 'w'.charCodeAt(0), 'x'.charCodeAt(0), 'y'.charCodeAt(0), 'z'.charCodeAt(0),
        '0'.charCodeAt(0), '1'.charCodeAt(0), '2'.charCodeAt(0), '3'.charCodeAt(0), '4'.charCodeAt(0), '5'.charCodeAt(0),
        '6'.charCodeAt(0), '7'.charCodeAt(0), '8'.charCodeAt(0), '9'.charCodeAt(0), '-'.charCodeAt(0), '_'.charCodeAt(0)
    ];

    /**
     * Used in decoding URL- and Filename-safe dialects of Base64.
     */
    private static readonly _URL_SAFE_DECODABET = [
        -9, -9, -9, -9, -9, -9, -9, -9, -9,                 // Decimal  0 -  8
        -5, -5,                                      // Whitespace: Tab and Linefeed
        -9, -9,                                      // Decimal 11 - 12
        -5,                                         // Whitespace: Carriage Return
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 14 - 26
        -9, -9, -9, -9, -9,                             // Decimal 27 - 31
        -5,                                         // Whitespace: Space
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,              // Decimal 33 - 42
        -9,                                         // Plus sign at decimal 43
        -9,                                         // Decimal 44
        62,                                         // Minus sign at decimal 45
        -9,                                         // Decimal 46
        -9,                                         // Slash at decimal 47
        52, 53, 54, 55, 56, 57, 58, 59, 60, 61,              // Numbers zero through nine
        -9, -9, -9,                                   // Decimal 58 - 60
        -1,                                         // Equals sign at decimal 61
        -9, -9, -9,                                   // Decimal 62 - 64
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,            // Letters 'A' through 'N'
        14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,        // Letters 'O' through 'Z'
        -9, -9, -9, -9,                                // Decimal 91 - 94
        63,                                         // Underscore at decimal 95
        -9,                                         // Decimal 96
        26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,     // Letters 'a' through 'm'
        39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,     // Letters 'n' through 'z'
        -9, -9, -9, -9, -9                              // Decimal 123 - 127
        , -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 128 - 139
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 140 - 152
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 153 - 165
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 166 - 178
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 179 - 191
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 192 - 204
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 205 - 217
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 218 - 230
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 231 - 243
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9         // Decimal 244 - 255
    ];



    /* ********  O R D E R E D   B A S E 6 4   A L P H A B E T  ******** */

    /**
     * I don't get the point of this technique, but someone requested it,
     * and it is described here:
     * <a href="http://www.faqs.org/qa/rfcc-1940.html">http://www.faqs.org/qa/rfcc-1940.html</a>.
     */
    private static readonly _ORDERED_ALPHABET = [
        '-'.charCodeAt(0),
        '0'.charCodeAt(0), '1'.charCodeAt(0), '2'.charCodeAt(0), '3'.charCodeAt(0), '4'.charCodeAt(0),
        '5'.charCodeAt(0), '6'.charCodeAt(0), '7'.charCodeAt(0), '8'.charCodeAt(0), '9'.charCodeAt(0),
        'A'.charCodeAt(0), 'B'.charCodeAt(0), 'C'.charCodeAt(0), 'D'.charCodeAt(0), 'E'.charCodeAt(0), 'F'.charCodeAt(0), 'G'.charCodeAt(0),
        'H'.charCodeAt(0), 'I'.charCodeAt(0), 'J'.charCodeAt(0), 'K'.charCodeAt(0), 'L'.charCodeAt(0), 'M'.charCodeAt(0), 'N'.charCodeAt(0),
        'O'.charCodeAt(0), 'P'.charCodeAt(0), 'Q'.charCodeAt(0), 'R'.charCodeAt(0), 'S'.charCodeAt(0), 'T'.charCodeAt(0), 'U'.charCodeAt(0),
        'V'.charCodeAt(0), 'W'.charCodeAt(0), 'X'.charCodeAt(0), 'Y'.charCodeAt(0), 'Z'.charCodeAt(0),
        '_'.charCodeAt(0),
        'a'.charCodeAt(0), 'b'.charCodeAt(0), 'c'.charCodeAt(0), 'd'.charCodeAt(0), 'e'.charCodeAt(0), 'f'.charCodeAt(0), 'g'.charCodeAt(0),
        'h'.charCodeAt(0), 'i'.charCodeAt(0), 'j'.charCodeAt(0), 'k'.charCodeAt(0), 'l'.charCodeAt(0), 'm'.charCodeAt(0), 'n'.charCodeAt(0),
        'o'.charCodeAt(0), 'p'.charCodeAt(0), 'q'.charCodeAt(0), 'r'.charCodeAt(0), 's'.charCodeAt(0), 't'.charCodeAt(0), 'u'.charCodeAt(0),
        'v'.charCodeAt(0), 'w'.charCodeAt(0), 'x'.charCodeAt(0), 'y'.charCodeAt(0), 'z'.charCodeAt(0)
    ];

    /**
     * Used in decoding the "ordered" dialect of Base64.
     */
    private static readonly _ORDERED_DECODABET = [
        -9, -9, -9, -9, -9, -9, -9, -9, -9,                 // Decimal  0 -  8
        -5, -5,                                      // Whitespace: Tab and Linefeed
        -9, -9,                                      // Decimal 11 - 12
        -5,                                         // Whitespace: Carriage Return
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 14 - 26
        -9, -9, -9, -9, -9,                             // Decimal 27 - 31
        -5,                                         // Whitespace: Space
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,              // Decimal 33 - 42
        -9,                                         // Plus sign at decimal 43
        -9,                                         // Decimal 44
        0,                                          // Minus sign at decimal 45
        -9,                                         // Decimal 46
        -9,                                         // Slash at decimal 47
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,                       // Numbers zero through nine
        -9, -9, -9,                                   // Decimal 58 - 60
        -1,                                         // Equals sign at decimal 61
        -9, -9, -9,                                   // Decimal 62 - 64
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,     // Letters 'A' through 'M'
        24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,     // Letters 'N' through 'Z'
        -9, -9, -9, -9,                                // Decimal 91 - 94
        37,                                         // Underscore at decimal 95
        -9,                                         // Decimal 96
        38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,     // Letters 'a' through 'm'
        51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63,     // Letters 'n' through 'z'
        -9, -9, -9, -9, -9                                 // Decimal 123 - 127
        , -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 128 - 139
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 140 - 152
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 153 - 165
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 166 - 178
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 179 - 191
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 192 - 204
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 205 - 217
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 218 - 230
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9,     // Decimal 231 - 243
        -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9         // Decimal 244 - 255
    ];


    /* ********  D E T E R M I N E   W H I C H   A L H A B E T  ******** */


    /**
     * Returns one of the _SOMETHING_ALPHABET byte arrays depending on
     * the options specified.
     * It's possible, though silly, to specify ORDERED <b>and</b> URLSAFE
     * in which case one of them will be picked, though there is
     * no guarantee as to which one will be picked.
     */
    private static getAlphabet(options: number): number[] {
        if ((options & Base64.URL_SAFE) === Base64.URL_SAFE) {
            return Base64._URL_SAFE_ALPHABET;
        } else if ((options & Base64.ORDERED) === Base64.ORDERED) {
            return Base64._ORDERED_ALPHABET;
        } else {
            return Base64._STANDARD_ALPHABET;
        }
    }


    /**
     * Returns one of the _SOMETHING_DECODABET byte arrays depending on
     * the options specified.
     * It's possible, though silly, to specify ORDERED and URL_SAFE
     * in which case one of them will be picked, though there is
     * no guarantee as to which one will be picked.
     */
    private static getDecodabet(options: number): number[] {
        if ((options & Base64.URL_SAFE) === Base64.URL_SAFE) {
            return Base64._URL_SAFE_DECODABET;
        } else if ((options & Base64.ORDERED) === Base64.ORDERED) {
            return Base64._ORDERED_DECODABET;
        } else {
            return Base64._STANDARD_DECODABET;
        }
    }


    /**
     * Defeats instantiation.
     */
    private constructor() { }




    /* ********  E N C O D I N G   M E T H O D S  ******** */


    /**
     * Encodes up to the first three bytes of array <var>threeBytes</var>
     * and returns a four-byte array in Base64 notation.
     * The actual number of significant bytes in your array is
     * given by <var>numSigBytes</var>.
     * The array <var>threeBytes</var> needs only be as big as
     * <var>numSigBytes</var>.
     * Code can reuse a byte array by passing a four-byte array as <var>b4</var>.
     *
     * @param b4          A reusable byte array to reduce array instantiation
     * @param threeBytes  the array to convert
     * @param numSigBytes the number of significant bytes in your array
     * @return four byte array in Base64 notation.
     * @since 1.5.1
     */
    private static encode3to4(b4: number[], threeBytes: number[], numSigBytes: number, options: number): number[] {
        Base64.encode3to4(threeBytes, 0, numSigBytes, b4, 0, options);
        return b4;
    }


    /**
     * <p>Encodes up to three bytes of the array <var>source</var>
     * and writes the resulting four Base64 bytes to <var>destination</var>.
     * The source and destination arrays can be manipulated
     * anywhere along their length by specifying
     * <var>srcOffset</var> and <var>destOffset</var>.
     * This method does not check to make sure your arrays
     * are large enough to accomodate <var>srcOffset</var> + 3 for
     * the <var>source</var> array or <var>destOffset</var> + 4 for
     * the <var>destination</var> array.
     * The actual number of significant bytes in your array is
     * given by <var>numSigBytes</var>.</p>
     * <p>This is the lowest level of the encoding methods with
     * all possible parameters.</p>
     *
     * @param source      the array to convert
     * @param srcOffset   the index where conversion begins
     * @param numSigBytes the number of significant bytes in your array
     * @param destination the array to hold the conversion
     * @param destOffset  the index where output will be put
     * @return the <var>destination</var> array
     * @since 1.3
     */
    private static encode3to4(
        source: number[], srcOffset: number, numSigBytes: number,
        destination: number[], destOffset: number, options: number): number[] {

        const ALPHABET = Base64.getAlphabet(options);

        const inBuff = (numSigBytes > 0 ? ((source[srcOffset] << 24) >>> 8) : 0)
            | (numSigBytes > 1 ? ((source[srcOffset + 1] << 24) >>> 16) : 0)
            | (numSigBytes > 2 ? ((source[srcOffset + 2] << 24) >>> 24) : 0);

        switch (numSigBytes) {
            case 3:
                destination[destOffset] = ALPHABET[(inBuff >>> 18)];
                destination[destOffset + 1] = ALPHABET[(inBuff >>> 12) & 0x3f];
                destination[destOffset + 2] = ALPHABET[(inBuff >>> 6) & 0x3f];
                destination[destOffset + 3] = ALPHABET[(inBuff) & 0x3f];
                return destination;

            case 2:
                destination[destOffset] = ALPHABET[(inBuff >>> 18)];
                destination[destOffset + 1] = ALPHABET[(inBuff >>> 12) & 0x3f];
                destination[destOffset + 2] = ALPHABET[(inBuff >>> 6) & 0x3f];
                destination[destOffset + 3] = Base64.EQUALS_SIGN;
                return destination;

            case 1:
                destination[destOffset] = ALPHABET[(inBuff >>> 18)];
                destination[destOffset + 1] = ALPHABET[(inBuff >>> 12) & 0x3f];
                destination[destOffset + 2] = Base64.EQUALS_SIGN;
                destination[destOffset + 3] = Base64.EQUALS_SIGN;
                return destination;

            default:
                return destination;
        }
    }


    /**
     * Encodes a byte array into Base64 notation.
     * Does not GZip-compress data.
     *
     * @param source The data to convert
     * @return The data in Base64-encoded form
     * @throws NullPointerException if source array is null
     * @since 1.4
     */
    public static encodeBytes(source: number[]): string {
        let encoded: string = null;
        try {
            encoded = Base64.encodeBytes(source, 0, source.length, Base64.NO_OPTIONS);
        } catch (ex) {
            console.assert(false, ex.message);
        }
        console.assert(encoded != null);
        return encoded;
    }


    /**
     * Encodes a byte array into Base64 notation.
     * <p>
     * Example options:<pre>
     *   GZIP: gzip-compresses object before encoding it.
     *   DO_BREAK_LINES: break lines at 76 characters
     *     <i>Note: Technically, this makes your encoding non-compliant.</i>
     * </pre>
     * <p>
     * Example: <code>encodeBytes( myData, Base64.GZIP )</code> or
     * <p>
     * Example: <code>encodeBytes( myData, Base64.GZIP | Base64.DO_BREAK_LINES )</code>
     *
     *
     * <p>As of v 2.3, if there is an error with the GZIP stream,
     * the method will throw an java.io.IOException. <b>This is new to v2.3!</b>
     * In earlier versions, it just returned a null value, but
     * in retrospect that's a pretty poor way to handle it.</p>
     *
     * @param source  The data to convert
     * @param options Specified options
     * @return The Base64-encoded data as a String
     * @throws java.io.IOException  if there is an error
     * @throws NullPointerException if source array is null
     * @see Base64#GZIP
     * @see Base64#DO_BREAK_LINES
     * @since 2.0
     */
    public static encodeBytes(source: number[], options: number): string {
        return Base64.encodeBytes(source, 0, source.length, options);
    }


    /**
     * Encodes a byte array into Base64 notation.
     * Does not GZip-compress data.
     *
     * <p>As of v 2.3, if there is an error,
     * the method will throw an java.io.IOException. <b>This is new to v2.3!</b>
     * In earlier versions, it just returned a null value, but
     * in retrospect that's a pretty poor way to handle it.</p>
     *
     * @param source The data to convert
     * @param off    Offset in array where conversion should begin
     * @param len    Length of data to convert
     * @return The Base64-encoded data as a String
     * @throws NullPointerException     if source array is null
     * @throws IllegalArgumentException if source array, offset, or length are invalid
     * @since 1.4
     */
    public static encodeBytes(source: number[], off: number, len: number): string {
        let encoded: string = null;
        try {
            encoded = Base64.encodeBytes(source, off, len, Base64.NO_OPTIONS);
        } catch (ex) {
            console.assert(false, ex.message);
        }
        console.assert(encoded != null);
        return encoded;
    }


    /**
     * Encodes a byte array into Base64 notation.
     * <p>
     * Example options:<pre>
     *   GZIP: gzip-compresses object before encoding it.
     *   DO_BREAK_LINES: break lines at 76 characters
     *     <i>Note: Technically, this makes your encoding non-compliant.</i>
     * </pre>
     * <p>
     * Example: <code>encodeBytes( myData, Base64.GZIP )</code> or
     * <p>
     * Example: <code>encodeBytes( myData, Base64.GZIP | Base64.DO_BREAK_LINES )</code>
     *
     *
     * <p>As of v 2.3, if there is an error with the GZIP stream,
     * the method will throw an java.io.IOException. <b>This is new to v2.3!</b>
     * In earlier versions, it just returned a null value, but
     * in retrospect that's a pretty poor way to handle it.</p>
     *
     * @param source  The data to convert
     * @param off     Offset in array where conversion should begin
     * @param len     Length of data to convert
     * @param options Specified options
     * @return The Base64-encoded data as a String
     * @throws java.io.IOException      if there is an error
     * @throws NullPointerException     if source array is null
     * @throws IllegalArgumentException if source array, offset, or length are invalid
     * @see Base64#GZIP
     * @see Base64#DO_BREAK_LINES
     * @since 2.0
     */
    public static encodeBytes(source: number[], off: number, len: number, options: number): string {
        const encoded = Base64.encodeBytesToBytes(source, off, len, options);
        return String.fromCharCode.apply(null, encoded);
    }


    /**
     * Similar to {@link #encodeBytes(byte[])} but returns
     * a byte array instead of instantiating a String. This is more efficient
     * if you're working with I/O streams and have large data sets to encode.
     *
     * @param source The data to convert
     * @return The Base64-encoded data as a byte[] (of ASCII characters)
     * @throws NullPointerException if source array is null
     * @since 2.3.1
     */
    public static encodeBytesToBytes(source: number[]): number[] {
        let encoded: number[] = null;
        try {
            encoded = Base64.encodeBytesToBytes(source, 0, source.length, Base64.NO_OPTIONS);
        } catch (ex) {
            console.assert(false, "IOExceptions only come from GZipping, which is turned off: " + ex.message);
        }
        return encoded;
    }


    /**
     * Similar to {@link #encodeBytes(byte[], int, int, int)} but returns
     * a byte array instead of instantiating a String. This is more efficient
     * if you're working with I/O streams and have large data sets to encode.
     *
     * @param source  The data to convert
     * @param off     Offset in array where conversion should begin
     * @param len     Length of data to convert
     * @param options Specified options
     * @return The Base64-encoded data as a String
     * @throws java.io.IOException      if there is an error
     * @throws NullPointerException     if source array is null
     * @throws IllegalArgumentException if source array, offset, or length are invalid
     * @see Base64#GZIP
     * @see Base64#DO_BREAK_LINES
     * @since 2.3.1
     */
    public static encodeBytesToBytes(source: number[], off: number, len: number, options: number): number[] {

        if (source == null) {
            throw new Error("Cannot serialize a null array.");
        }

        if (off < 0) {
            throw new Error("Cannot have negative offset: " + off);
        }

        if (len < 0) {
            throw new Error("Cannot have length offset: " + len);
        }

        if (off + len > source.length) {
            throw new Error(
                `Cannot have offset of ${off} and length of ${len} with array of length ${source.length}`);
        }

        if ((options & Base64.GZIP) !== 0) {
            // Gzip functionality not implemented in JS version
            throw new Error("GZIP option is not supported in this TypeScript version.");
        } else {
            const breakLines = (options & Base64.DO_BREAK_LINES) !== 0;

            let encLen = Math.floor(len / 3) * 4 + (len % 3 > 0 ? 4 : 0);
            if (breakLines) {
                encLen += Math.floor(encLen / Base64.MAX_LINE_LENGTH);
            }
            const outBuff = new Array(encLen);


            let d = 0;
            let e = 0;
            const len2 = len - 2;
            let lineLength = 0;
            for (; d < len2; d += 3, e += 4) {
                Base64.encode3to4(source, d + off, 3, outBuff, e, options);

                lineLength += 4;
                if (breakLines && lineLength >= Base64.MAX_LINE_LENGTH) {
                    outBuff[e + 4] = Base64.NEW_LINE;
                    e++;
                    lineLength = 0;
                }
            }

            if (d < len) {
                Base64.encode3to4(source, d + off, len - d, outBuff, e, options);
                e += 4;
            }


            if (e <= outBuff.length - 1) {
                const finalOut = new Array(e);
                finalOut.splice(0, e, ...outBuff.slice(0, e));
                return finalOut;
            } else {
                return outBuff;
            }

        }

    }





    /* ********  D E C O D I N G   M E T H O D S  ******** */


    /**
     * Decodes four bytes from array <var>source</var>
     * and writes the resulting bytes (up to three of them)
     * to <var>destination</var>.
     * The source and destination arrays can be manipulated
     * anywhere along their length by specifying
     * <var>srcOffset</var> and <var>destOffset</var>.
     * This method does not check to make sure your arrays
     * are large enough to accomodate <var>srcOffset</var> + 4 for
     * the <var>source</var> array or <var>destOffset</var> + 3 for
     * the <var>destination</var> array.
     * This method returns the actual number of bytes that
     * were converted from the Base64 encoding.
     * <p>This is the lowest level of the decoding methods with
     * all possible parameters.</p>
     *
     * @param source      the array to convert
     * @param srcOffset   the index where conversion begins
     * @param destination the array to hold the conversion
     * @param destOffset  the index where output will be put
     * @param options     alphabet type is pulled from this (standard, url-safe, ordered)
     * @return the number of decoded bytes converted
     * @throws NullPointerException     if source or destination arrays are null
     * @throws IllegalArgumentException if srcOffset or destOffset are invalid
     *                                  or there is not enough room in the array.
     * @since 1.3
     */
    private static decode4to3(
        source: number[], srcOffset: number,
        destination: number[], destOffset: number, options: number): number {

        if (source == null) {
            throw new Error("Source array was null.");
        }
        if (destination == null) {
            throw new Error("Destination array was null.");
        }
        if (srcOffset < 0 || srcOffset + 3 >= source.length) {
            throw new Error(`Source array with length ${source.length} cannot have offset of ${srcOffset} and still process four bytes.`);
        }
        if (destOffset < 0 || destOffset + 2 >= destination.length) {
            throw new Error(`Destination array with length ${destination.length} cannot have offset of ${destOffset} and still store three bytes.`);
        }


        const DECODABET = Base64.getDecodabet(options);

        if (source[srcOffset + 2] === Base64.EQUALS_SIGN) {
            const outBuff = ((DECODABET[source[srcOffset]] & 0xFF) << 18)
                | ((DECODABET[source[srcOffset + 1]] & 0xFF) << 12);

            destination[destOffset] = (outBuff >>> 16);
            return 1;
        }

        else if (source[srcOffset + 3] === Base64.EQUALS_SIGN) {
            const outBuff = ((DECODABET[source[srcOffset]] & 0xFF) << 18)
                | ((DECODABET[source[srcOffset + 1]] & 0xFF) << 12)
                | ((DECODABET[source[srcOffset + 2]] & 0xFF) << 6);

            destination[destOffset] = (outBuff >>> 16);
            destination[destOffset + 1] = (outBuff >>> 8);
            return 2;
        }

        else {
            const outBuff = ((DECODABET[source[srcOffset]] & 0xFF) << 18)
                | ((DECODABET[source[srcOffset + 1]] & 0xFF) << 12)
                | ((DECODABET[source[srcOffset + 2]] & 0xFF) << 6)
                | ((DECODABET[source[srcOffset + 3]] & 0xFF));


            destination[destOffset] = (outBuff >> 16);
            destination[destOffset + 1] = (outBuff >> 8);
            destination[destOffset + 2] = (outBuff);

            return 3;
        }
    }


    /**
     * Low-level access to decoding ASCII characters in
     * the form of a byte array. <strong>Ignores GUNZIP option, if
     * it's set.</strong> This is not generally a recommended method,
     * although it is used internally as part of the decoding process.
     * Special case: if len = 0, an empty array is returned. Still,
     * if you need more speed and reduced memory footprint (and aren't
     * gzipping), consider this method.
     *
     * @param source The Base64 encoded data
     * @return decoded data
     * @since 2.3.1
     * @throws java.io.IOException If bogus characters are contained in the input
     */
    public static decode(source: number[]): number[] {
        let decoded: number[] = null;
        decoded = Base64.decode(source, 0, source.length, Base64.NO_OPTIONS);
        return decoded;
    }


    /**
     * Low-level access to decoding ASCII characters in
     * the form of a byte array. <strong>Ignores GUNZIP option, if
     * it's set.</strong> This is not generally a recommended method,
     * although it is used internally as part of the decoding process.
     * Special case: if len = 0, an empty array is returned. Still,
     * if you need more speed and reduced memory footprint (and aren't
     * gzipping), consider this method.
     *
     * @param source  The Base64 encoded data
     * @param off     The offset of where to begin decoding
     * @param len     The length of characters to decode
     * @param options Can specify options such as alphabet type to use
     * @return decoded data
     * @throws java.io.IOException If bogus characters exist in source data
     * @since 1.3
     */
    public static decode(source: number[], off: number, len: number, options: number): number[] {

        if (source == null) {
            throw new Error("Cannot decode null source array.");
        }
        if (off < 0 || off + len > source.length) {
            throw new Error(`Source array with length ${source.length} cannot have offset of ${off} and process ${len} bytes.`);
        }

        if (len === 0) {
            return [];
        } else if (len < 4) {
            throw new Error(
                "Base64-encoded string must have at least four characters, but length specified was " + len);
        }

        const DECODABET = Base64.getDecodabet(options);

        const len34 = Math.floor(len * 3 / 4);
        const outBuff = new Array(len34);
        let outBuffPosn = 0;

        const b4 = new Array(4);
        let b4Posn = 0;
        let i = 0;
        let sbiDecode = 0;

        for (i = off; i < off + len; i++) {

            sbiDecode = DECODABET[source[i] & 0xFF];

            if (sbiDecode >= Base64.WHITE_SPACE_ENC) {
                if (sbiDecode >= Base64.EQUALS_SIGN_ENC) {
                    b4[b4Posn++] = source[i];
                    if (b4Posn > 3) {
                        outBuffPosn += Base64.decode4to3(b4, 0, outBuff, outBuffPosn, options);
                        b4Posn = 0;

                        if (source[i] === Base64.EQUALS_SIGN) {
                            break;
                        }
                    }
                }
            }
            else {
                throw new Error(`Bad Base64 input character decimal ${(source[i]) & 0xFF} in array position ${i}`);
            }
        }

        const out = new Array(outBuffPosn);
        out.splice(0, outBuffPosn, ...outBuff.slice(0, outBuffPosn));
        return out;
    }


    /**
     * Decodes data from Base64 notation, automatically
     * detecting gzip-compressed data and decompressing it.
     *
     * @param s the string to decode
     * @return the decoded data
     * @throws java.io.IOException If there is a problem
     * @since 1.4
     */
    public static decodeString(s: string): number[] {
        return Base64.decode(s, Base64.NO_OPTIONS);
    }


    /**
     * Decodes data from Base64 notation, automatically
     * detecting gzip-compressed data and decompressing it.
     *
     * @param s       the string to decode
     * @param options encode options such as URL_SAFE
     * @return the decoded data
     * @throws java.io.IOException  if there is an error
     * @throws NullPointerException if <tt>s</tt> is null
     * @since 1.4
     */
    public static decode(s: string, options: number): number[] {

        if (s == null) {
            throw new Error("Input string was null.");
        }

        let bytes: number[];
        try {
            bytes = s.split('').map(c => c.charCodeAt(0));
        }
        catch (uee) {
            bytes = s.split('').map(c => c.charCodeAt(0));
        }

        bytes = Base64.decode(bytes, 0, bytes.length, options);

        const dontGunzip = (options & Base64.DONT_GUNZIP) !== 0;
        if ((bytes != null) && (bytes.length >= 4) && (!dontGunzip)) {
            // Gzip functionality not implemented in JS version
        }

        return bytes;
    }
}
