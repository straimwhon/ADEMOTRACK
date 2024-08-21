<?php
include 'db_operations.php';

if (isset($_GET['key'])) {
    $key = $_GET['key'];
    $data = getFromDatabase($key);
    echo json_encode(['data' => $data]);
}
?>
