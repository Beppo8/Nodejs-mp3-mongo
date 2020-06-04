const multer = require('multer');
const { getConnection } = require('../database');
const { GridFSBucket, ObjectID } = require('mongodb');
const { Readable } = require('stream');

const getTrack =  (req, res) => {
    
    let trackID;

    try {
        trackID = new ObjectID(req.params.trackID);
    } catch (error) {
        return res.status(400).json({message: 'Invalid track ID in URL'});
    }

    res.set('content-type', 'audio/mp3');
    res.set('accept-rages', 'bytes');

    const db = getConnection();
    const bucket = new GridFSBucket(db, {
        bucketName: 'tracks'
    });

    let downloadStream = bucket.openDownloadStream(trackID);

    downloadStream.on('data', chunk => {
        res.write(chunk);
    });

    downloadStream.on('error', () => {
        res.sendStatus(404);
    });

    downloadStream.on('end', () => {
        res.end();
    });

};

const uploadTrack = (req, res) => {
    const storage = multer.memoryStorage();
    const upload = multer({
        storage,
        limits: {
            fields: 1,
            files: 1,
            part: 2
        }
    });
    upload.single('track')(req, res, (err) => {
        if (err) {
            console.log(err);
            return res.status(400).json({message: err.message});
        } else if (!req.body.name) {
            return res.status(400).json({message: 'No track name in request body'});
        }
        let trackName = req.body.name;

        const readableTrackStream = new Readable();
        readableTrackStream.push(req.file.buffer);
        readableTrackStream.push(null);

        const db = getConnection();
        const bucket = new GridFSBucket(db, {
            bucketName: 'tracks'
        });

        let uploadStream = bucket.openUploadStream(trackName);
        const id = uploadStream.id;
        readableTrackStream.pipe(uploadStream);

        uploadStream.on('error', () => {
            return res.status(500).json({message: 'Error uploading your file'});
        });

        uploadStream.on('finish', () => {
            return res.status(201).json({message: 'File Uploaded successfully, stored under ID: ' + id})
            })
        });
};

module.exports = {
    getTrack,
    uploadTrack
}