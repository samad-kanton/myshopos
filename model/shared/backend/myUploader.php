<?php

    $phpFileUploadErrors = array(
        0 => 'There is no error, the file uploaded with success',
        1 => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
        2 => 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form',
        3 => 'The uploaded file was only partially uploaded',
        4 => 'No file was uploaded',
        6 => 'Missing a temporary folder',
        7 => 'Failed to write file to disk.',
        8 => 'A PHP extension stopped the file upload.',
    );

    class MyUploader {
        private $entity;
        private $uploads_dir = [
            'stock' => '../uploads/stocks/',
            'staff' => '../uploads/staff/',
            'vendors' => '../uploads/vendors/',
            'customers' => '../uploads/customers/',
        ];
        private $files;
        private $allowedExts;

        function __construct($params){
            // $this->uploads_dir = $params['uploads_dir'];
            $this->entity = $params['entity'];
            $this->files = $params['files'];
            $this->allowedExts = $params['allowedExts'];
        }

        public function fileObj(){
            if(count($this->files['name']) > 0){
                unset($_SESSION['fileObj']);                
                for ($i = 0; $i < count($this->files['name']); $i++) {
                    $_SESSION['fileObj']["types"][] = explode('/', $this->files['type'][$i])[1]; 
                    $_SESSION['fileObj']["names"][] = bin2hex(random_bytes(4)) . "." . $_SESSION['fileObj']['types'][$i];
                    $_SESSION['fileObj']['temps'][] = $this->files['tmp_name'][$i];
                    $_SESSION['fileObj']['sizes'][] = $this->files['size'][$i];
            
                    // in_array($json['fileTypes'][$i], $this->allowedExts) ? $json['invalidTypes'][] = $this->files['name'][$i] : '';
                    // $json['fileSizes'][$i] <= 1000000 ? '' : $json['invalidSizes'][] = $this->files['name'][$i];
                }
                return [
                    'types' => $_SESSION['fileObj']['types'],
                    'names' => $_SESSION['fileObj']['names'],
                    'temps' => $_SESSION['fileObj']['temps'],
                    'sizes' => $_SESSION['fileObj']['sizes']
                ];
            }
        }

        public function move(){
            for ($i = 0; $i < count($_SESSION['fileObj']['names']); $i++) {
                $json['filesMoved'][] = move_uploaded_file($_SESSION['fileObj']['temps'][$i], $this->uploads_dir[$this->entity] . $_SESSION['fileObj']["names"][$i]);
            }
            return [
                'filesMoved' => $json['filesMoved']
            ];
        }

        public function delete($oldFiles){
            if($oldFiles != null){
                for ($i = 0; $i < count($oldFiles); $i++) {
                    $json['filesDeleted'][] = file_exists($this->uploads_dir[$this->entity] . $oldFiles[$i]) ? unlink($this->uploads_dir[$this->entity] . $oldFiles[$i]) : null;
                }
            }
            return [
                'filesDeleted' => $json['filesDeleted']
                // 'filesDeleted' => $oldFiles
                // 'filesMoved' => [
                //     'oldFiles_count' => count($oldFiles),
                //     'uploads_dir' => $this->uploads_dir[$this->entity],
                //     'oldFiles' => $oldFiles[0],
                //     'exist' => unlink($this->uploads_dir[$this->entity] . $oldFiles[0])
                // ]
            ];
        }
    }

?>