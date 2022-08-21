
<?php
    
    require('../model/conn.php');
    require('../model/shared/backend/myUploader.php');

    $json = [];
    $json['is_uploaded_files'] = is_uploaded_file($_FILES['files']['tmp_name'][0]);

    $json['myUploader'] = new MyUploader($json['is_uploaded_files'] ? ['entity' => 'stock', 'files' => $_FILES['files'], 'allowedExts' => array('jpg', 'jpeg', 'png')] : ['entity' => 'stock', ]);    
    ['names' => $json['myFileUploaderFiles']] = $json['is_uploaded_files'] ? $json['myUploader']->fileObj() : null;

    try{
        if(isset($_GET['pop'])){
            $q = $con->prepare("SELECT * FROM setup;");
            $q->execute();
            $json['data'] = $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
        }
        elseif(isset($_GET['new'])){
            $json['data'] = $_REQUEST;            
            // if(isset($_FILES['company_logo'])){
            //     $myFileUploader = new MyFileUploader($_FILES['company_logo']);  // Create a new instance of the MyFileUploader class
            //     ['tmp_name' => $tmp_name, 'newFileName' => $newFileName] = $myFileUploader->fileInfo(); // Destruct the array and get the file info using the fileInfo() method and assign it to the variables
            //     $json['file_moved'] = $myFileUploader->moveFile("$COMPANY_UPLOAD_DIR/$newFileName"); // Move the file to the uploads folder
            // }
            // $q = $con->prepare("INSERT INTO setup(comp_name, slogan, tax_id, industry, phone, email, website, addr, logo) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);");
            // $json['saved'] = $q->execute([$_POST['company_name'], $_POST['slogan'], $_POST['tax_id'], $_POST['industry'], $_POST['phone'], $_POST['email'] ?? null, $_POST['website'] ?? null, $_POST['addr'], $newFileName ?? null]) ? true : $con->errorInfo();           
        }
        elseif(isset($_GET['update'])){
            $json['data'] = $_REQUEST;
            // if(isset($_FILES['company_logo'])){
            //     $myFileUploader = new MyFileUploader($_FILES['company_logo']);  // Create a new instance of the MyFileUploader class
            //     ['tmp_name' => $tmp_name, 'newFileName' => $newFileName] = $myFileUploader->fileInfo(); // Destruct the array and get the file info using the fileInfo() method and assign it to the variables
            //     $json['file_moved'] = $myFileUploader->moveFile("$COMPANY_UPLOAD_DIR/$newFileName"); // Move the file to the uploads folder
            // }
            // file_exists("$COMPANY_UPLOAD_DIR/$_GET[oldFile]") ? unlink("$COMPANY_UPLOAD_DIR/$_GET[oldFile]") : null; // Delete the old file if it exists
            // $q = $con->prepare("UPDATE setup SET comp_name=?, slogan=?, tax_id=?, industry=?, phone=?, email=?, website=?, addr=?, logo=? WHERE comp_id=$_GET[comp_id];");
            // $json['updated'] = $q->execute([$_POST['company_name'], $_POST['slogan'], $_POST['tax_id'], $_POST['industry'], $_POST['phone'], $_POST['email'] ?? null, $_POST['website'] ?? null, $_POST['addr'], $newFileName ?? null]) ? true : $con->errorInfo();   
        }
        elseif(isset($_GET['delete'])){
            // $q = $con->prepare("DELETE FROM stock WHERE prod_id=:prod_id;");
            // $json['deleted'] = $q->execute([':prod_id' => $_POST['key']]) ? true : false;
            // $q = $con->prepare("UPDATE stock SET active=false WHERE prod_id=:prod_id;");
            // $json['deleted'] = $q->execute([':prod_id' => $_POST['key']]) ? true : $con->errorInfo();
        }

        if(isset($_GET['prefs'])){
            // $json['data'] = $_REQUEST;
            if(isset($_GET['set'])){
                $q = $con->prepare("UPDATE config SET pref=JSON_SET(pref, '$.$_POST[pref]', '$_POST[value]') WHERE module='$_POST[module]';");
                $json['updated'] = $q->execute() ? true : false;  
            }
            elseif(isset($_GET['pop'])){
                // $json['data'] = $_REQUEST;
                $q = $con->prepare("SELECT pref FROM config;");
                $q->execute();
                $json['data'] = $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
            }

            if(isset($_GET['currencies'])){
                $json['data'] = $_REQUEST;
                $json['json_doc'] = json_decode($_POST['cellData']);
                // $json['is_NewRecord'] = $json['currencyData']->new_record;
                // if($json['is_NewRecord']->new_record){
                // //     // $json['json_path'] = $_POST['cellData']['id']-1;
                // //     // $json['json_doc'] = json_encode($_POST['cellData'], JSON_FORCE_OBJECT | JSON_NUMERIC_CHECK);
                // //     // $q = $con->prepare("UPDATE config SET pref=JSON_UNQUOTE(JSON_ARRAY_APPEND(pref, '$', '$json[json_doc]')) WHERE module='currencies';");
                // //     // $json['saved'] = $q->execute() ? true : false;  
                // }
                // else{
                //     $json['json_path'] = $json['json_doc']->id - 1;
                //     $json['json_doc'] = json_encode($_POST['cellData'], true, JSON_FORCE_OBJECT | JSON_NUMERIC_CHECK | JSON_UNESCAPED_SLASHES);
                //     $q = $con->prepare("UPDATE config SET pref=JSON_UNQUOTE(JSON_SET(pref, '$[$json[json_path]]', '$json[json_doc]')) WHERE module='currencies';");
                //     $json['updated'] = $q->execute() ? true : false;  
                // }
                
                if(isset($_GET['new'])){

                }
                elseif(isset($_GET['update'])){
                    $json['value'] = $_POST['col'] == "is_default" ? $_POST["value"] : "'$_POST[value]'";
                    if($_POST['col'] == "is_default"){
                        $con->prepare("UPDATE currencies SET is_default=0;")->execute();
                    }
                    $json['updated'] =  $con->prepare("UPDATE currencies SET $_POST[col]=$json[value] WHERE currency_id=$_POST[currency_id];")->execute() ? true : false;  
                }
                else{
                    $q = $con->prepare("SELECT * FROM currencies;");
                    $q->execute();
                    $json['data'] = $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
                }
            }
        }

        if(isset($_GET['database'])){
            // $json['data'] = $_REQUEST;            
            if(isset($_GET['backup'])){

            }
        }        
        
    } catch (PDOException $e) {
        $json['data'] = "Error: " . $e->getMessage();
    }

    echo json_encode($json);

?>
