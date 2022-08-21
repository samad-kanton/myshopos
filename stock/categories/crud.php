<?php

    require('../../model/conn.php');

    try{
        if(isset($_GET['pop'])){
            $q = $con->prepare("SELECT * FROM categories ORDER BY cat_name;");
            $q->execute();
            $json['data'] = $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
        }
        elseif(isset($_GET['new'])){
            // $json['data'] = $_REQUEST;
            $q = $con->prepare("INSERT INTO categories(cat_name, color, emp_id) VALUES(?, ?, ?)");
            $json['saved'] = $q->execute([$_POST['cat_name'], $_POST['lblColor'], $_GET['emp_id']]) ? true : false;
        }
        elseif(isset($_GET['update'])){
            // $json['data'] = $_REQUEST;
            $q = $con->prepare("UPDATE categories SET cat_name='$_POST[cat_name]', color='$_POST[lblColor]' WHERE cat_id=$_POST[cat_id];");
            $json['updated'] = $q->execute() ? true : $con->errorInfo();
        }
        elseif(isset($_GET['delete'])){
            $q = $con->prepare("DELETE FROM categories WHERE cat_id=:cat_id;");
            $json['deleted'] = $q->execute([':cat_id' => $_POST['key']]) ? true : false;
        }
    } catch (PDOException $e) {
        $json['data'] = "Error: " . $e->getMessage();
    }

    echo json_encode($json);

?>