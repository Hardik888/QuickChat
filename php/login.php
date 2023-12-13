<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

$conn = new mysqli("localhost", "root", "", "library");

if (mysqli_connect_error()) {
    echo mysqli_connect_error();
    exit();
} else {
    $eData = file_get_contents("php://input");
    $dData = json_decode($eData, true);

    $email = $dData['email'];
    $password = $dData['password'];
    
    $result = "";

    if ($email != "" && $password != "") {
        // Check if the user exists in the database
        $sql = "SELECT * FROM users WHERE email = '$email'";
        $res = mysqli_query($conn, $sql);

        if ($res) {
            $row = mysqli_fetch_assoc($res);

            if ($row) {
                
                if ($password === $row['password']) {
                    $result = "Login successful!";
                } else {
                    $result = "Incorrect password";
                }
            } else {
                $result = "User not found";
            }
        } else {
            $result = "Query error: " . mysqli_error($conn);
        }
    } else {
        $result = "All fields are required!";
    }

    $conn->close();
    $response[] = array("result" => $result);
    echo json_encode($response);
}
?>