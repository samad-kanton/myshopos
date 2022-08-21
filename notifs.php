<?php
    require('./model/conn.php');

    try {
        // $q = $con->prepare("SELECT (SELECT item FROM stock WHERE qty <= 0 LIMIT 2) AS zeroStock FROM stock;");
        $q = $con->prepare("SELECT * FROM stock WHERE qty <= 0 AND active != false;");
        $q->execute();

        $q2 = $con->prepare("SELECT * FROM stock WHERE qty <= restock AND active != false;");
        $q2->execute();

        $now = date('Y-m-d');
        $expireInThreeMonths = date(('Y-m-d'), strtotime('now +3months'));
        $q3 = $con->prepare("SELECT * FROM stock WHERE expdate BETWEEN ('$now' AND '$expireInThreeMonths') AND active != false;");
        $q3->execute();

        $json['data'] = [
            'zeroStock' => $q->fetchAll(PDO::FETCH_ASSOC),
            'lowStock' => $q2->fetchAll(PDO::FETCH_ASSOC),
            'expiredStock' => $q3->fetchAll(PDO::FETCH_ASSOC),
        ];
    } catch (PDOException $e) {
        $json['err'] = $e->getMessage();
    }

    echo json_encode($json);

?>