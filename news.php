<?php

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}


/*
|--------------------------------------------------------------------------
| PATHS
|--------------------------------------------------------------------------
*/

$projectRoot = __DIR__;

$newsFile =
    $projectRoot . '/newsdata/news.json';

$imageFolder =
    $projectRoot . '/uploads/images/';

$pdfFolder =
    $projectRoot . '/uploads/pdfs/';

$videosFile =
    $projectRoot . '/newsdata/videosList.json';
/*
|--------------------------------------------------------------------------
| CREATE DIRECTORIES IF MISSING
|--------------------------------------------------------------------------
*/

if (!is_dir($imageFolder)) {
    mkdir($imageFolder, 0755, true);
}

if (!is_dir($pdfFolder)) {
    mkdir($pdfFolder, 0755, true);
}


/*
|--------------------------------------------------------------------------
| READ NEWS
|--------------------------------------------------------------------------
*/

function readNews()
{
    global $newsFile;

    if (!file_exists($newsFile)) {
        return [];
    }

    $json =
        file_get_contents($newsFile);

    $data =
        json_decode($json, true);

    return is_array($data)
        ? $data
        : [];
}

/*
|--------------------------------------------------------------------------
| VIDEOS LIST
|--------------------------------------------------------------------------
*/
function readVideos()
{
    global $videosFile;

    if (!file_exists($videosFile)) {
        return [];
    }

    $json =
        file_get_contents($videosFile);

    $data =
        json_decode($json, true);

    return is_array($data)
        ? $data
        : [];
}

/*
|--------------------------------------------------------------------------
| SAVE NEWS
|--------------------------------------------------------------------------
*/

function saveNews($news)
{
    global $newsFile;

    $json = json_encode(
        $news,
        JSON_PRETTY_PRINT |
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    if ($json === false) {
        return false;
    }

    return file_put_contents(
        $newsFile,
        $json,
        LOCK_EX
    ) !== false;
}
  /*
    |--------------------------------------------------------------------------
    | SAVE VIDEOS
    |--------------------------------------------------------------------------
    */
function saveVideos($videos)
{
    global $videosFile;

    $json = json_encode(
        $videos,
        JSON_PRETTY_PRINT |
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    if ($json === false) {
        return false;
    }

    return file_put_contents(
        $videosFile,
        $json,
        LOCK_EX
    ) !== false;
}

function isValidYouTubeUrl($url)
{
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return false;
    }

    $host = strtolower(
        parse_url($url, PHP_URL_HOST) ?? ''
    );

    $validHosts = [
        'youtube.com',
        'www.youtube.com',
        'm.youtube.com',
        'youtu.be'
    ];

    return in_array(
        $host,
        $validHosts,
        true
    );
}

/*
|--------------------------------------------------------------------------
| GENERATE UID
|--------------------------------------------------------------------------
*/

function generateUid()
{
    return bin2hex(
        random_bytes(16)
    );
}

function saveJsonFile($file, $items)
{
    $json = json_encode(
        $items,
        JSON_PRETTY_PRINT |
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    if ($json === false) {
        return false;
    }

    return file_put_contents(
        $file,
        $json,
        LOCK_EX
    ) !== false;
}


/*
|--------------------------------------------------------------------------
| REQUEST
|--------------------------------------------------------------------------
*/

$method =
    $_SERVER['REQUEST_METHOD'];

$action =
    $_GET['action'] ?? '';

$id =
    $_GET['id'] ?? '';

    $slug = $_GET['slug'] ?? '';

    $requestLanguage = strtolower(
    trim($_GET['language'] ?? '')
);

$requestType = strtolower(
    trim($_GET['type'] ?? '')
);

 
/*
|--------------------------------------------------------------------------
| GET ARTICLE BY LANGUAGE, TYPE AND SLUG
|--------------------------------------------------------------------------
*/

if (
    $method === 'GET' &&
    $slug !== ''
) {
    $allowedLanguages = [
        'english',
        'marathi',
        'hindi',
        'kannada',
        'gujarati',
        'malayalam',
        'punjabi'
    ];

    $allowedTypes = [
        'onlinemedia',
        'video'
    ];

    if (
        !in_array(
            $requestLanguage,
            $allowedLanguages,
            true
        ) ||
        !in_array(
            $requestType,
            $allowedTypes,
            true
        )
    ) {
        http_response_code(400);

        echo json_encode([
            'message' => 'Invalid language or type.',
            'language' => $requestLanguage,
            'type' => $requestType
        ]);

        exit;
    }

    $file =
        $projectRoot .
        '/newsdata/' .
        $requestLanguage .
        '/' .
        $requestType .
        '.json';

    if (!file_exists($file)) {
        http_response_code(404);

        echo json_encode([
            'message' => 'Article file not found.',
            'file' => $file
        ]);

        exit;
    }

    $items = json_decode(
        file_get_contents($file),
        true
    );

    if (!is_array($items)) {
        http_response_code(500);

        echo json_encode([
            'message' => 'Invalid article JSON data.'
        ]);

        exit;
    }

    foreach ($items as $item) {
        if (
            isset($item['slug']) &&
            $item['slug'] === $slug
        ) {
            echo json_encode(
                $item,
                JSON_UNESCAPED_UNICODE |
                JSON_UNESCAPED_SLASHES
            );

            exit;
        }
    }

    http_response_code(404);

    echo json_encode([
        'message' => 'Article not found.',
        'slug' => $slug
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| GET ALL NEWS OR VIDEOS
|--------------------------------------------------------------------------
|
| GET /news.php
| GET /news.php?language=English
|
*/

if ($method === 'GET' &&  $slug === '') {

     $type = strtolower(
        trim($_GET['type'] ?? 'onlinemedia')
    );

    $language = strtolower(
        trim($_GET['language'] ?? 'english')
    );

    $allowedLanguages = [
        'english',
        'marathi',
        'hindi',
        'kannada',
        'gujarati',
        'malayalam',
        'punjabi'
    ];

    $allowedTypes = [
        'onlinemedia',
        'video'
    ];


    /*
    |--------------------------------------------------------------------------
    | GET VIDEOS
    |--------------------------------------------------------------------------
    */

    if ($type === 'video') {
    if (
        !in_array(
            $language,
            $allowedLanguages,
            true
        )
    ) {
        http_response_code(400);

        echo json_encode([
            'message' => 'Invalid language.'
        ]);

        exit;
    }

    $videoFile =
        $projectRoot .
        '/newsdata/' .
        $language .
        '/video.json';

    if (!file_exists($videoFile)) {
        echo json_encode([]);
        exit;
    }

    $videos = json_decode(
        file_get_contents($videoFile),
        true
    );

    if (!is_array($videos)) {
        $videos = [];
    }

    echo json_encode(
        $videos,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}

    /*
    |--------------------------------------------------------------------------
    | GET NEWS
    |--------------------------------------------------------------------------
    */
    if (
        !in_array(
            $language,
            $allowedLanguages,
            true
        )
    ) {
        http_response_code(400);

        echo json_encode([
            'message' => 'Invalid language.'
        ]);

        exit;
    }

    if (
        !in_array(
            $type,
            $allowedTypes,
            true
        )
    ) {
        http_response_code(400);

        echo json_encode([
            'message' => 'Invalid content type.'
        ]);

        exit;
    }

    $jsonFile =
        $projectRoot .
        '/newsdata/' .
        $language .
        '/' .
        $type .
        '.json';

    if (!file_exists($jsonFile)) {
        echo json_encode([]);

        exit;
    }

    $json =
        file_get_contents($jsonFile);

    $items =
        json_decode($json, true);

    if (!is_array($items)) {
        $items = [];
    }

    echo json_encode(
        $items,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}

/*
|--------------------------------------------------------------------------
| INCREMENT VIEW
|--------------------------------------------------------------------------
|
| POST /news.php?action=view&id=xxxxx
|     &language=english&type=onlinemedia
|
*/

if (
    $method === 'POST' &&
    $action === 'view' &&
    $id !== ''
) {
    $allowedLanguages = [
        'english',
        'marathi',
        'hindi',
        'kannada',
        'gujarati',
        'malayalam',
        'punjabi'
    ];

    $allowedTypes = [
        'onlinemedia',
        'video'
    ];

    if (
        !in_array(
            $requestLanguage,
            $allowedLanguages,
            true
        ) ||
        !in_array(
            $requestType,
            $allowedTypes,
            true
        )
    ) {
        http_response_code(400);

        echo json_encode([
            'message' => 'Invalid language or type.',
            'language' => $requestLanguage,
            'type' => $requestType
        ]);

        exit;
    }

    $file =
        $projectRoot .
        '/newsdata/' .
        $requestLanguage .
        '/' .
        $requestType .
        '.json';

    if (!file_exists($file)) {
        http_response_code(404);

        echo json_encode([
            'message' => 'Content file not found.',
            'file' => $file
        ]);

        exit;
    }

    $items = json_decode(
        file_get_contents($file),
        true
    );

    if (!is_array($items)) {
        http_response_code(500);

        echo json_encode([
            'message' => 'Invalid JSON data.'
        ]);

        exit;
    }

    $found = false;
    $updatedViews = 0;

    foreach ($items as &$item) {
        if (
            isset($item['uid']) &&
            $item['uid'] === $id
        ) {
            $item['views'] =
                (int)($item['views'] ?? 0) + 1;

            $updatedViews = $item['views'];
            $found = true;

            break;
        }
    }

    unset($item);

    if (!$found) {
        http_response_code(404);

        echo json_encode([
            'message' => 'Content item not found.'
        ]);

        exit;
    }

    if (!saveJsonFile($file, $items)) {
        http_response_code(500);

        echo json_encode([
            'message' => 'Unable to update views.'
        ]);

        exit;
    }

    echo json_encode([
        'views' => $updatedViews,
        'type' => $requestType
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| INCREMENT LIKE
|--------------------------------------------------------------------------
|
| POST /news.php?action=like&id=xxxxx
|     &language=english&type=onlinemedia
|
*/

if (
    $method === 'POST' &&
    $action === 'like' &&
    $id !== ''
) {
    $allowedLanguages = [
        'english',
        'marathi',
        'hindi',
        'kannada',
        'gujarati',
        'malayalam',
        'punjabi'
    ];

    $allowedTypes = [
        'onlinemedia',
        'video'
    ];

    if (
        !in_array(
            $requestLanguage,
            $allowedLanguages,
            true
        ) ||
        !in_array(
            $requestType,
            $allowedTypes,
            true
        )
    ) {
        http_response_code(400);

        echo json_encode([
            'message' => 'Invalid language or type.',
            'language' => $requestLanguage,
            'type' => $requestType
        ]);

        exit;
    }

    $file =
        $projectRoot .
        '/newsdata/' .
        $requestLanguage .
        '/' .
        $requestType .
        '.json';

    if (!file_exists($file)) {
        http_response_code(404);

        echo json_encode([
            'message' => 'Content file not found.',
            'file' => $file
        ]);

        exit;
    }

    $items = json_decode(
        file_get_contents($file),
        true
    );

    if (!is_array($items)) {
        http_response_code(500);

        echo json_encode([
            'message' => 'Invalid JSON data.'
        ]);

        exit;
    }

    $found = false;
    $updatedLikes = 0;

    foreach ($items as &$item) {
        if (
            isset($item['uid']) &&
            $item['uid'] === $id
        ) {
            $item['likes'] =
                (int)($item['likes'] ?? 0) + 1;

            $updatedLikes = $item['likes'];
            $found = true;

            break;
        }
    }

    unset($item);

    if (!$found) {
        http_response_code(404);

        echo json_encode([
            'message' => 'Content item not found.'
        ]);

        exit;
    }

    if (!saveJsonFile($file, $items)) {
        http_response_code(500);

        echo json_encode([
            'message' => 'Unable to update likes.'
        ]);

        exit;
    }

    echo json_encode([
        'likes' => $updatedLikes,
        'type' => $requestType
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| CREATE slug
|--------------------------------------------------------------------------
|
|
*/
function createSlug($text, $maxWords = 7)
{
    $text = trim($text);

    if ($text === '') {
        return '';
    }

    // Convert title to lowercase where applicable
    if (function_exists('mb_strtolower')) {
        $text = mb_strtolower($text, 'UTF-8');
    } else {
        $text = strtolower($text);
    }

    $words = preg_split(
        '/\s+/u',
        $text,
        -1,
        PREG_SPLIT_NO_EMPTY
    );

    if (!is_array($words)) {
        return '';
    }

    // Keep only the first 7 words
    $words = array_slice($words, 0, $maxWords);

    $cleanWords = [];

    foreach ($words as $word) {
      
        $word = preg_replace(
            '/[^\p{L}\p{M}\p{N}]+/u',
            '',
            $word
        );

        if ($word !== null && $word !== '') {
            $cleanWords[] = $word;
        }
    }

    return implode('-', $cleanWords);
}

function createUniqueSlug($title, $items, $maxWords = 7)
{
    $baseSlug = createSlug($title, $maxWords);

    if ($baseSlug === '') {
        $baseSlug = 'news-article';
    }

    $slug = $baseSlug;
    $counter = 2;

    $existingSlugs = array_column(
        $items,
        'slug'
    );

    while (in_array($slug, $existingSlugs, true)) {
        $slug = $baseSlug . '-' . $counter;
        $counter++;
    }

    return $slug;
}

/*
|--------------------------------------------------------------------------
| CREATE NEWS
|--------------------------------------------------------------------------
|
| POST /news.php?action=create
|
*/


if (
    $method === 'POST' &&
    $action === 'create'
) {

    $imageUrl = '';
    $pdfUrl = '';

$type =
    ($_POST['type'] ?? '') === 'video'
        ? 'video'
        : 'onlinemedia';

$videoUrl = trim(
    $_POST['videoUrl'] ?? ''
);
$title = trim(
        $_POST['title'] ?? ''
    );

    $publication = trim(
        $_POST['publication'] ?? ''
    );

    $date = trim(
        $_POST['date'] ?? ''
    );

    $language = strtolower(
        trim($_POST['language'] ?? 'english')
    );

     /*
    |--------------------------------------------------------------------------
    | BASIC VALIDATION
    |--------------------------------------------------------------------------
    */

    if ($title === '') {
        http_response_code(400);

        echo json_encode([
            'message' => 'Title is required.'
        ]);

        exit;
    }

    if ($publication === '') {
        http_response_code(400);

        echo json_encode([
            'message' => 'Publication is required.'
        ]);

        exit;
    }

    if ($date === '') {
        http_response_code(400);

        echo json_encode([
            'message' => 'Publication date is required.'
        ]);

        exit;
    }

    $allowedLanguages = [
        'english',
        'marathi',
        'hindi',
        'kannada',
        'gujarati',
        'malayalam',
        'punjabi'
    ];

    if (
        !in_array(
            $language,
            $allowedLanguages,
            true
        )
    ) {
        http_response_code(400);

        echo json_encode([
            'message' => 'Invalid language.'
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | VIDEO VALIDATION
    |--------------------------------------------------------------------------
    */

    if ($type === 'video') {
        if ($videoUrl === '') {
            http_response_code(400);

            echo json_encode([
                'message' =>
                    'YouTube video URL is required.'
            ]);

            exit;
        }

        if (!isValidYouTubeUrl($videoUrl)) {
            http_response_code(400);

            echo json_encode([
                'message' =>
                    'Enter a valid YouTube URL.'
            ]);

            exit;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | IMAGE REQUIRED
    |--------------------------------------------------------------------------
    */
if ($type === 'onlinemedia') {
    if (
        !isset($_FILES['image']) ||
        $_FILES['image']['error'] !== UPLOAD_ERR_OK
    ) {

        http_response_code(400);

        echo json_encode([
            'message' =>
                'Image is required.'
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | IMAGE VALIDATION
    |--------------------------------------------------------------------------
    */

    $allowedImageExtensions = [
        'jpg',
        'jpeg',
        'png',
        'webp'
    ];


    $imageExtension =
        strtolower(
            pathinfo(
                $_FILES['image']['name'],
                PATHINFO_EXTENSION
            )
        );


    if (
        !in_array(
            $imageExtension,
            $allowedImageExtensions,
            true
        )
    ) {

        http_response_code(400);

        echo json_encode([
            'message' =>
                'Invalid image type.'
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | SAVE IMAGE
    |--------------------------------------------------------------------------
    */

     $imageMimeType = mime_content_type(
            $_FILES['image']['tmp_name']
        );

        $allowedImageMimeTypes = [
             'image/jpg',
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (
            !in_array(
                $imageMimeType,
                $allowedImageMimeTypes,
                true
            )
        ) {
            http_response_code(400);

            echo json_encode([
                'message' =>
                    'Invalid image content.'
            ]);

            exit;
        }

    $imageFileName =
        time() .
        '-' .
        bin2hex(random_bytes(8)) .
        '.' .
        $imageExtension;


    $imageDestination =
        $imageFolder .
        $imageFileName;


    if (
        !move_uploaded_file(
            $_FILES['image']['tmp_name'],
            $imageDestination
        )
    ) {

        http_response_code(500);

        echo json_encode([
            'message' =>
                'Unable to save image.'
        ]);

        exit;
    }

     $imageUrl =
        'http://localhost:8080/uploads/images/' .
        $imageFileName;
}
     /*
    |--------------------------------------------------------------------------
    | youtube video
    |--------------------------------------------------------------------------
    */
   if (
    $type === 'video' &&
    $videoUrl === ''
) {
    http_response_code(400);

    echo json_encode([
        'message' => 'YouTube video URL is required.'
    ]);

    exit;
}
if (
    $type === 'video' &&
    !isValidYouTubeUrl($videoUrl)
) {
    http_response_code(400);

    echo json_encode([
        'message' =>
            'Enter a valid YouTube URL.'
    ]);

    exit;
}

    /*
    |--------------------------------------------------------------------------
    | OPTIONAL PDF
    |--------------------------------------------------------------------------
    */

    $pdfUrl = '';


    if (
         $type === 'onlinemedia' &&
        isset($_FILES['pdf']) &&
        $_FILES['pdf']['error'] === UPLOAD_ERR_OK
    ) {

        $pdfExtension =
            strtolower(
                pathinfo(
                    $_FILES['pdf']['name'],
                    PATHINFO_EXTENSION
                )
            );
 $pdfMimeType = mime_content_type(
            $_FILES['pdf']['tmp_name']
        );

        if ($pdfExtension !== 'pdf' ||  $pdfMimeType !== 'application/pdf') {

            http_response_code(400);

            echo json_encode([
                'message' =>
                    'Invalid PDF.'
            ]);

            exit;
        }


        $pdfFileName =
            time() .
            '-' .
            bin2hex(random_bytes(8)) .
            '.pdf';


        $pdfDestination =
            $pdfFolder .
            $pdfFileName;


        if (
            !move_uploaded_file(
                $_FILES['pdf']['tmp_name'],
                $pdfDestination
            )
        ) {

            http_response_code(500);

            echo json_encode([
                'message' =>
                    'Unable to save PDF.'
            ]);

            exit;
        }


        $pdfUrl =
            'http://localhost:8080/uploads/pdfs/' .
            $pdfFileName;
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE ARTICLE
    |--------------------------------------------------------------------------
    */

    $slug = createSlug($_POST['title'] ?? '');

   $language = strtolower(
    trim($_POST['language'] ?? 'english')
);

$type =
    ($_POST['type'] ?? '') === 'video'
        ? 'video'
        : 'onlinemedia';

$allowedLanguages = [
    'english',
    'marathi',
    'hindi',
    'kannada',
    'gujarati',
    'malayalam',
    'punjabi'
];

if (!in_array($language, $allowedLanguages, true)) {
    http_response_code(400);

    echo json_encode([
        'message' => 'Invalid language.'
    ]);

    exit;
}
 /*
    |--------------------------------------------------------------------------
    | LANGUAGE FOLDER AND JSON FILE
    |--------------------------------------------------------------------------
    */
    
$folder =
    $projectRoot .
    '/newsdata/' .
    $language;

if (
    !is_dir($folder) &&
    !mkdir($folder, 0755, true)
) {
    http_response_code(500);

    echo json_encode([
        'message' => 'Unable to create language folder.'
    ]);

    exit;
}

$jsonFile =
    $folder .
    '/' .
    $type .
    '.json';

      /*
    |--------------------------------------------------------------------------
    | LOAD EXISTING CONTENT
    |--------------------------------------------------------------------------
    */
        $news = [];
        
if (file_exists($jsonFile)) {
    $storedData = json_decode(
        file_get_contents($jsonFile),
        true
    );

    if (is_array($storedData)) {
        $news = $storedData;
    }
}
 /*
    |--------------------------------------------------------------------------
    | UNIQUE SLUG
    |--------------------------------------------------------------------------
    */
$slug = createUniqueSlug(
    $_POST['title'] ?? '',
    $news,
    7
);

  /*
    |--------------------------------------------------------------------------
    | CREATE ARTICLE
    |--------------------------------------------------------------------------
    */

    $article = [

        'uid' =>
            generateUid(),
        'slug' => $slug,
         'title' =>
            $title,

        'publication' =>
            $publication,

        'date' =>
            $date,

            'language' => ucfirst($language),

    'type' => $type,

      

         'imageUrl' =>
        $imageUrl,

    'videoUrl' =>
        $type === 'video'
            ? $videoUrl
            : '',

        'smallDescription' =>
            $_POST['smallDescription'] ?? '',

        'largeDescription' =>
            $_POST['largeDescription'] ?? '',

        'originalNewsUrl' =>
            $_POST['originalNewsUrl'] ?? '',

        'disclaimerPublication' =>
            $_POST['disclaimerPublication'] ?? '',

         'pdfUrl' =>
        $type === 'onlinemedia'
            ? $pdfUrl
            : '',

        'createdAt' =>
            gmdate('c'),

        'views' =>
            0,

        'likes' =>
            0

    ];



 /*
    |--------------------------------------------------------------------------
    | SAVE ARTICLE
    |--------------------------------------------------------------------------
    */

array_unshift(
    $news,
    $article
);


 if (!saveJsonFile($jsonFile, $news)) {
        http_response_code(500);

        echo json_encode([
            'message' =>
                'Unable to save article.'
        ]);

        exit;
    }
 /*
    |--------------------------------------------------------------------------
    | SUCCESS RESPONSE
    |--------------------------------------------------------------------------
    */

http_response_code(201);

echo json_encode(
    $article,
    JSON_UNESCAPED_UNICODE |
    JSON_UNESCAPED_SLASHES |
    JSON_THROW_ON_ERROR
);

exit;
}


/*
|--------------------------------------------------------------------------
| INVALID REQUEST
|--------------------------------------------------------------------------
*/

http_response_code(400);

echo json_encode([
    'message' =>
        'Invalid request.'
]);

?>