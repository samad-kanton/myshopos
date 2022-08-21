<?php

    require('../model/conn.php');
    require('../model/shared/backend/myUploader.php');

    $json['is_uploaded_files'] = is_uploaded_file($_FILES['files']['tmp_name'][0]);
    $json['myUploader'] = new MyUploader(['entity' => 'staff', 'files' => $_FILES['files'], 'allowedExts' => array('jpg', 'jpeg', 'png')]);    
    if(isset($_FILES['files']) && is_uploaded_file($_FILES['files']['tmp_name'][0])){
        ['names' => $json['myFileUploaderFiles']] = $json['is_uploaded_files'] ? $json['myUploader']->fileObj() : null;
    }

    try{
        if(isset($_GET['pop'])){
            // $q = $con->prepare("SELECT *  FROM employees WHERE emp_id != 1;");
            $q = $con->prepare("SELECT * FROM employees;");
            $q->execute();
            $json['data'] = $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
        }
        elseif(isset($_GET['new'])){
            // $json['data'] = $_REQUEST;
            $q = $con->prepare("INSERT INTO employees(fullname, pin, phone, urole, rights, photos, active) VALUES(?, ?, ?, ?, ?, ?, ?);");
            if($q->execute([$_POST['fullname'], $_POST['pin'], $_POST['phone'], $_POST['urole'], $_POST['rights'], (isset($json['myFileUploaderFiles']) ? json_encode($json['myFileUploaderFiles']) : null), $_POST['isActive'] ?? 0])){
                $json['saved'] = $json['is_uploaded_files'] ? ['filesMoved' => $json['myUploaderFilesMoved']] = $json['myUploader']->move()['filesMoved'][0] : true;
            }
        }
        elseif(isset($_GET['update'])){
            // $json['data'] = $_REQUEST;
            // $json['oldFiles'] = json_decode($_POST['oldFiles']) ?: null;
            $json['updatePhotos'] = $json['is_uploaded_files'] ? "'" . json_encode($json['myFileUploaderFiles']) . "'" : ((!$json['is_uploaded_files'] && json_decode($_POST['oldFiles']) != null) ? 'NULL' : "photos");
            $q = $con->prepare("UPDATE employees SET fullname=?, pin=?, phone=?, urole=?, rights=?, photos=$json[updatePhotos], active=? WHERE emp_id=$_POST[emp_id];");
            if($q->execute([$_POST['fullname'], $_POST['pin'], $_POST['phone'], $_POST['urole'], $_POST['rights'], $_POST['isActive'] ?? 0])){
                $json['filesDeleted'] = json_decode($_POST['oldFiles']) ? ['filesDeleted' => $json['myFileUploaderFilesDeleted']] = $json['myUploader']->delete(json_decode($_POST['oldFiles']))['filesDeleted'] : null;
                $json['updated'] = $json['is_uploaded_files'] ? ['filesMoved' => $json['myUploaderFilesMoved']] = $json['myUploader']->move()['filesMoved'][0] : true;
            } 
        }
        elseif(isset($_GET['delete'])){
            // $q = $con->prepare("UPDATE employees SET active=0 WHERE emp_id=:emp_id;");
            // $json['deleted'] = $q->execute([':emp_id' => $_POST['key']]) ? true : false;
        }
        else{
            if(isset($_GET['update_staffBioData'])){                
                $json['data'] = json_encode($_REQUEST['rights']);
                // 'staff','true', 'stock', 'false', 'pos','false', 'reports','false'
                $q = $con->prepare("UPDATE employees SET rights='$json[data]' WHERE emp_id=$_POST[update_emp_id];");
                $json['updated'] = $q->execute() ? true : $con->errorInfo(); 
            }
        }        
    } catch (PDOException $e) {
        $json['data'] = "Error: " . $e->getMessage();
    }

    echo json_encode($json);

?>