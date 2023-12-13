<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

$conn = new mysqli("localhost", "root", "", "library");

if (mysqli_connect_error()) {
    echo mysqli_connect_error();
    exit();
} else {
    $result = array();

    $sql = "SELECT id, name, email FROM users";
    $res = mysqli_query($conn, $sql);

    if ($res) {
        while ($row = mysqli_fetch_assoc($res)) {
            $result[] = $row;
        }
    }

    $conn->close();
    echo json_encode($result);
}
?>