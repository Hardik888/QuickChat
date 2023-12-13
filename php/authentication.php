<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
global $fcm;
$fcm = '';
$conn = new mysqli("localhost", "root", "", "library");

if (mysqli_connect_error()) {
    echo mysqli_connect_error();
    exit();
} else {
    $eData = file_get_contents("php://input");
    $dData = json_decode($eData, true);

    $name = $dData['name'];
    $email = $dData['email'];
    $password = $dData['password'];
    
    $result = "";

    if ($name != "" && $email != "" && $password != "") {
        $sql = "INSERT INTO users(name, email, password,fcm_token) VALUES('$name', '$email', '$password','$fcm');";
        $res = mysqli_query($conn, $sql);

        if ($res) {
            $result = "You have registered successfully!";
        } else {
            $result = "";
        }
    } else {
        $result = "";
    }

    $conn->close();
    $response[] = array("result" => $result);
    echo json_encode($response);
}
?>
