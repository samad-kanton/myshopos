<?php
    
    require('./model/conn.php');

    class AuditLogs extends Db{

        function logs() {
            $q = $this->connect()->prepare("SELECT * FROM audit_logs;");
            $q->execute();
            return $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
        }

        function log($params) {
            [$plot, $activity, $host, $emp_id] = $params['fields'];     
            $q = $this->connect()->prepare("INSERT INTO audit_logs(plot, activity, host, emp_id) VALUES(?, ?, ?, ?)");
            return $q->execute([$plot, $activity, $host, $emp_id]) ? true : $this->connect()->errorInfo();      
        }

    }

    $auditLog = new AuditLogs(); // INSTANTIATE OBJECT

    try{
        if(isset($_GET['pop'])){            
            $json['data'] = $auditLog->logs();
        }
        elseif(isset($_GET['new'])){
            // $json['data'] = $_REQUEST;            
            $json['saved'] = $auditLog->log(['fields' => [$_POST['plot'], $_POST['activity'], json_encode($_SERVER), $_POST['emp_id']]]);    
        }
    } catch (PDOException $e) {
        $json['data'] = "Error: " . $e->getMessage();
    }

    echo json_encode($json);

?>
