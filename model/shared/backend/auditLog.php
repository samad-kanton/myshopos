<?php
    
    class AuditLogs {
        static function logs($params) {
            $q = $con->prepare("SELECT * FROM audit_logs;");
            $q->execute();
            $json['data'] = $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
        }
        static function log($params) {
            $json['data'] = $_REQUEST;            
            $q = $con->prepare("INSERT INTO audit_logs(plot, activity, host, emp_id) VALUES(?, ?, ?, ?)");
            $json['saved'] = $q->execute([$_POST['plot'], $_POST['activity'], json_encode($_SERVER), $_POST['emp_id']]) ? true : $con->errorInfo();      
        }
    }

?>