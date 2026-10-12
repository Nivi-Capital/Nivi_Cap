const express = require('express');
const multer = require('multer');
const cors = require('cors');

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();

const PORT = 3000;


/*
|--------------------------------------------------------------------------
| Paths
|--------------------------------------------------------------------------
*/

const newsFilePath = path.join(
    __dirname,
    
    'newsdata',
    'news.json'
);

const imageFolder = path.join(
    __dirname,
    'src',
    'assets',
    'images',
    'news-pics'
);

const pdfFolder = path.join(
    __dirname,
    'src',
    'assets',
    'news-pdf'
);


/*
|--------------------------------------------------------------------------
| Create directories if missing
|--------------------------------------------------------------------------
*/

if (!fs.existsSync(imageFolder)) {
    fs.mkdirSync(
        imageFolder,
        { recursive: true }
    );
}

if (!fs.existsSync(pdfFolder)) {
    fs.mkdirSync(
        pdfFolder,
        { recursive: true }
    );
}


/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(cors());

app.use(express.json());


/*
|--------------------------------------------------------------------------
| Multer storage
|--------------------------------------------------------------------------
*/

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        if (file.fieldname === 'image') {

            cb(
                null,
                imageFolder
            );

            return;
        }

        if (file.fieldname === 'pdf') {

            cb(
                null,
                pdfFolder
            );

            return;
        }

        cb(
            new Error('Invalid file field')
        );
    },


    filename: function (req, file, cb) {

        const uniqueName =
            `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname)}`;

        cb(
            null,
            uniqueName
        );
    }

});


const upload = multer({
    storage: storage
});


/*
|--------------------------------------------------------------------------
| GET NEWS
|--------------------------------------------------------------------------
*/

app.get(
    '/api/news',
    (req, res) => {

        try {

            const data =
                fs.readFileSync(
                    newsFilePath,
                    'utf8'
                );

            let news =
                JSON.parse(data);

            const language =
                req.query.language;

            if (language) {

                news = news.filter(
                    item =>
                        item.language === language
                );
            }

            res.json(news);

        } catch (error) {

            console.error(
                'GET NEWS ERROR:',
                error
            );

            res.status(500).json({
                message:
                    'Unable to read news.'
            });
        }
    }
);


/*
|--------------------------------------------------------------------------
| GET NEWS BY ID
|--------------------------------------------------------------------------
*/

app.get(
    '/api/news/:id',
    (req, res) => {

        try {

            const data =
                fs.readFileSync(
                    newsFilePath,
                    'utf8'
                );

            const news =
                JSON.parse(data);

            const article =
                news.find(
                    item =>
                        item.uid === req.params.id
                );

            if (!article) {

                return res
                    .status(404)
                    .json({
                        message:
                            'News article not found.'
                    });
            }

            res.json(article);

        } catch (error) {

            console.error(
                'GET NEWS BY ID ERROR:',
                error
            );

            res.status(500).json({
                message:
                    'Unable to read article.'
            });
        }
    }
);


/*
|--------------------------------------------------------------------------
| CREATE NEWS
|--------------------------------------------------------------------------
*/

app.post(
    '/api/news',

    upload.fields([
        {
            name: 'image',
            maxCount: 1
        },
        {
            name: 'pdf',
            maxCount: 1
        }
    ]),

    (req, res) => {

        try {

            const files =
                req.files;

            const image =
                files?.image?.[0];

            const pdf =
                files?.pdf?.[0];


            if (!image) {

                return res
                    .status(400)
                    .json({
                        message:
                            'Image is required.'
                    });
            }


            /*
            |--------------------------------------------------------------------------
            | Create article
            |--------------------------------------------------------------------------
            */

            const article = {

                uid:
                    crypto.randomUUID(),

                title:
                    req.body.title,

                publication:
                    req.body.publication,

                date:
                    req.body.date,

                language:
                    req.body.language,

                type:
                    req.body.type || 'text',

                imageUrl:
                    `assets/images/news-pics/${image.filename}`,

                smallDescription:
                    req.body.smallDescription,

                largeDescription:
                    req.body.largeDescription,

                originalNewsUrl:
                    req.body.originalNewsUrl || '',

                disclaimerPublication:
                    req.body.disclaimerPublication || '',

                // disclaimerLink:
                //     req.body.disclaimerLink || '',

                pdfUrl: pdf
                    ? `assets/news-pdf/${pdf.filename}`
                    : '',

                createdAt:
                    new Date().toISOString(),
                    views: 0,
                    likes: 0,

            };


            /*
            |--------------------------------------------------------------------------
            | Read news.json
            |--------------------------------------------------------------------------
            */

            const data =
                fs.readFileSync(
                    newsFilePath,
                    'utf8'
                );


            const news =
                JSON.parse(data);




           

            /*
            |--------------------------------------------------------------------------
            | Add newest article first
            |--------------------------------------------------------------------------
            */

            news.unshift(article);


            /*
            |--------------------------------------------------------------------------
            | Write news.json
            |--------------------------------------------------------------------------
            */

            fs.writeFileSync(
                newsFilePath,
                JSON.stringify(
                    news,
                    null,
                    2
                ),
                'utf8'
            );

            console.log(
                'News added:',
                article.uid
            );


            res.status(201).json(
                article
            );

        } catch (error) {

            console.error(
                'CREATE NEWS ERROR:',
                error
            );

            res.status(500).json({
                message:
                    'Unable to create news.'
            });
        }
    }
);


/*
|--------------------------------------------------------------------------
| Start server
|--------------------------------------------------------------------------
*/

app.listen(
    PORT,
    () => {

        console.log(
            `News API running at http://localhost:${PORT}`
        );

    }
);

/*
|--------------------------------------------------------------------------
| INCREMENT VIEW
|--------------------------------------------------------------------------
*/

app.post(
    '/api/news/:id/view',
    (req, res) => {

        try {

            const data =
                fs.readFileSync(
                    newsFilePath,
                    'utf8'
                );

            const news =
                JSON.parse(data);

            const article =
                news.find(
                    item =>
                        item.uid === req.params.id
                );

            if (!article) {

                return res
                    .status(404)
                    .json({
                        message:
                            'News article not found.'
                    });
            }


            article.views =
                (article.views || 0) + 1;


            fs.writeFileSync(
                newsFilePath,
                JSON.stringify(
                    news,
                    null,
                    2
                ),
                'utf8'
            );


            console.log(
                'View updated:',
                article.uid,
                article.views
            );


            return res.json({
                views:
                    article.views
            });

        } catch (error) {

            console.error(
                'VIEW COUNT ERROR:',
                error
            );

            return res
                .status(500)
                .json({
                    message:
                        'Unable to update views.'
                });
        }

    }
);

/*
|--------------------------------------------------------------------------
| INCREMENT LIKE
|--------------------------------------------------------------------------
*/

app.post(
    '/api/news/:id/like',
    (req, res) => {

        try {

            const data =
                fs.readFileSync(
                    newsFilePath,
                    'utf8'
                );

            const news =
                JSON.parse(data);

            const article =
                news.find(
                    item =>
                        item.uid === req.params.id
                );


            if (!article) {

                return res
                    .status(404)
                    .json({
                        message:
                            'News article not found.'
                    });
            }


            article.likes =
                (article.likes || 0) + 1;


            fs.writeFileSync(
                newsFilePath,
                JSON.stringify(
                    news,
                    null,
                    2
                ),
                'utf8'
            );


            console.log(
                'Like updated:',
                article.uid,
                article.likes
            );


            return res.json({
                likes:
                    article.likes
            });

        } catch (error) {

            console.error(
                'LIKE ERROR:',
                error
            );

            return res
                .status(500)
                .json({
                    message:
                        'Unable to update like.'
                });
        }

    }
);