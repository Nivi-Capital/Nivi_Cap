<?php

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


/*
|--------------------------------------------------------------------------
| GET ONE NEWS
|--------------------------------------------------------------------------
|
| GET /news.php?id=xxxxx
|
*/

if (
    $method === 'GET' &&
    $id !== ''
) {

    $news =
        readNews();
    $videos = readVideos();

    $allItems = array_merge(
    $news,
    $videos
);

    foreach ($allItems as $article) {

        if (
            isset($article['uid']) &&
            $article['uid'] === $id
        ) {

         // Normalize video fields
        if (
            isset($article['type']) &&
            $article['type'] === 'video'
        ) {

            $article['title'] =
                $article['Link'] ?? '';

            $article['publication'] =
                $article['Publication'] ?? '';

            $article['date'] =
                $article['Date'] ?? '';

            $article['language'] =
                $article['Language'] ?? '';

            $article['largeDescription'] =
                $article['largeDescription']
                ?? $article['largeDescription']
                ?? '';

            $article['smallDescription'] =
                $article['smallDescription']
                ?? '';

            $article['videoUrl'] =
                $article['URL'] ?? '';
        }
        
            echo json_encode(
                $article,
                JSON_UNESCAPED_UNICODE |
                JSON_UNESCAPED_SLASHES
            );

            exit;
        }
    }


    http_response_code(404);

    echo json_encode([
        'message' =>
            'News article not found.'
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

if ($method === 'GET') {
 $type = $_GET['type'] ?? 'text';
    $language = $_GET['language'] ?? '';

    /*
    |--------------------------------------------------------------------------
    | GET VIDEOS
    |--------------------------------------------------------------------------
    */

    if ($type === 'video') {

        $videos = readVideos();

        if ($language !== '') {
            $videos = array_values(
                array_filter(
                    $videos,
                    function ($video) use ($language) {
                        return
                            isset($video['Language']) &&
                            strcasecmp(
                                trim($video['Language']),
                                trim($language)
                            ) === 0;
                    }
                )
            );
        }

        $normalizedVideos = array_map(
            function ($video) {
                return [
                    'uid' =>
                        $video['uid'] ?? '',

                    'type' =>
                        'video',

                    'title' =>
                        $video['Link'] ?? '',

                    'publication' =>
                        $video['Publication'] ?? '',

                    'date' =>
                        $video['Date'] ?? '',

                    'language' =>
                        $video['Language'] ?? '',

                    'imageUrl' =>
                        $video['htmlFile'] ?? '',

                    'videoUrl' =>
                        $video['URL'] ?? '',

                    'smallDescription' =>
                        $video['smallDescription'] ?? '',

                    'largeDescription' =>
                        $video['largeDescription'] ?? '',

                    'views' =>
                        (int)($video['views'] ?? 0),

                    'likes' =>
                        (int)($video['likes'] ?? 0)
                ];
            },
            $videos
        );

        echo json_encode(
            $normalizedVideos,
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
    $news =
        readNews();

    $language =
        $_GET['language'] ?? '';


    if ($language !== '') {

        $news =
            array_values(
                array_filter(
                    $news,

                    function ($article) use ($language) {

                        return
                            isset($article['language']) &&
                            $article['language'] === $language;
                    }
                )
            );
    }


    echo json_encode(
        $news,
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
|
*/

if (
    $method === 'POST' &&
    $action === 'view' &&
    $id !== ''
) {
 /*
    |--------------------------------------------------------------------------
    | First search in news.json
    |--------------------------------------------------------------------------
    */
    $news =
        readNews();

    foreach ($news as &$article) {

        if (
            isset($article['uid']) &&
            $article['uid'] === $id
        ) {

            $article['views'] =
                (int)($article['views'] ?? 0) + 1;


            if (!saveNews($news)) {

                http_response_code(500);

                echo json_encode([
                    'message' =>
                        'Unable to update views.'
                ]);

                exit;
            }


            echo json_encode([
                'views' =>
                    $article['views']
            ]);

            exit;
        }
    }

    unset($article);

     /*
    |--------------------------------------------------------------------------
    | If not found, search in videosList.json
    |--------------------------------------------------------------------------
    */

    $videos = readVideos();

   foreach ($videos as &$video) {
       if (
            isset($video['uid']) &&
            $video['uid'] === $id
        ) {
            $video['views'] =
                (int)($video['views'] ?? 0) + 1;

           if (!saveVideos($videos)) {
                http_response_code(500);

                echo json_encode([
                    'message' =>
                        'Unable to update video views.'
                ]);

                exit;
            }

            echo json_encode([
                'views' => $video['views'],
                'type' => 'video'
            ]);

            exit;
        }
  }

    http_response_code(404);

    echo json_encode([
        'message' =>
            'News article not found.'
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| INCREMENT LIKE
|--------------------------------------------------------------------------
|
| POST /news.php?action=like&id=xxxxx
|
*/

if (
    $method === 'POST' &&
    $action === 'like' &&
    $id !== ''
) {

 /*
   |-------------------------------*----------------------------------*-------
    | First search in news*json
    |------------------------*----------------------------------*--------------
    */

    $news =
        readNews();

    foreach ($news as &$article) {

        if (
            isset($article['uid']) &&
            $article['uid'] === $id
        ) {

            $article['likes'] =
                (int)($article['likes'] ?? 0) + 1;


            if (!saveNews($news)) {

                http_response_code(500);

                echo json_encode([
                    'message' =>
                        'Unable to update likes.'
                ]);

                exit;
            }


            echo json_encode([
                'likes' =>
                    $article['likes']
            ]);

            exit;
        }
    }

    unset($article);

    /*
    |------------------------------------------------------------------------
    | If not found, search in videosList.json
    |------------------------------------------------------------------------
    */

    $videos = readVideos();

    foreach ($videos as &$video) {
        if (
           isset($video['uid']) &&
          $video['uid'] === $id
       ) {
            $video['likes'] =
              (int)($video['likes'] ?? 0) + 1;

            if (!saveVideos($videos)) {
               http_response_code(500);

               echo json_encode([
                   'message' =>
                      'Unable to update video likes.'
                ]);

            exit;
            }

           echo json_encode([
               'likes' => $video['likes'],
                'type' => 'video'
            ]);

            exit;
        }
    }


    http_response_code(404);

    echo json_encode([
        'message' =>
            'News article not found.'
    ]);

    exit;
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

    /*
    |--------------------------------------------------------------------------
    | IMAGE REQUIRED
    |--------------------------------------------------------------------------
    */

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

   


    /*
    |--------------------------------------------------------------------------
    | OPTIONAL PDF
    |--------------------------------------------------------------------------
    */

    $pdfUrl = '';


    if (
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


        if ($pdfExtension !== 'pdf') {

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

    $article = [

        'uid' =>
            generateUid(),

        'title' =>
            $_POST['title'] ?? '',

        'publication' =>
            $_POST['publication'] ?? '',

        'date' =>
            $_POST['date'] ?? '',

        'language' =>
            $_POST['language'] ?? 'English',

        'type' =>
            $_POST['type'] ?? 'text',

        'imageUrl' =>
            'http://localhost:8080/uploads/images/' .
            $imageFileName,

        'smallDescription' =>
            $_POST['smallDescription'] ?? '',

        'largeDescription' =>
            $_POST['largeDescription'] ?? '',

        'originalNewsUrl' =>
            $_POST['originalNewsUrl'] ?? '',

        'disclaimerPublication' =>
            $_POST['disclaimerPublication'] ?? '',

        // 'disclaimerLink' =>
        //     $_POST['disclaimerLink'] ?? '',

        'pdfUrl' =>
            $pdfUrl,

        'createdAt' =>
            gmdate('c'),

        'views' =>
            0,

        'likes' =>
            0

    ];


    /*
    |--------------------------------------------------------------------------
    | ADD NEWEST ARTICLE FIRST
    |--------------------------------------------------------------------------
    */

    $news =
        readNews();


    array_unshift(
        $news,
        $article
    );


    if (!saveNews($news)) {

        http_response_code(500);

        echo json_encode([
            'message' =>
                'Unable to save article.'
        ]);

        exit;
    }


    http_response_code(201);

    echo json_encode(
        $article,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
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