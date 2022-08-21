<?php
    $upload_dir = "../uploads";
    if(isset($_POST['submit']) && is_uploaded_file($_FILES['logo']['tmp_name'])){
        if(move_uploaded_file($_FILES['logo']['tmp_name'], "$upload_dir/" . $_FILES['logo']['name'])){
            echo $_FILES['logo']['name'] . "Successfully uploaded to $upload_dir";
        }
        else{
            echo "Ooopss... There was a problem with the upload.";
        }
    }
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <form action="<?php echo $_SERVER['PHP_SELF']; ?>" method="post" enctype="multipart/form-data">
        <input type="file" name="logo" id="logo">
        <button type="submit" name="submit">Submit</button>
    </form>
</body>
</html>