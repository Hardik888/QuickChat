<?php
// Database connection script (db_connect.php)
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "library";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


$sql = "SELECT * FROM messages";
$result = $conn->query($sql);


if ($result->num_rows > 0) {
  // Fetch messages and store them in an array
    $messages = array();
    while ($row = $result->fetch_assoc()) {
        $messages[] = array(
            'id' => $row['id'],
            'sender_id' => $row['sender_id'],
            'receiver_id' => $row['receiver_id'],
            'message_text' => $row['message_text'],
            'timestamp' => $row['timestamp']
            
        );
    }

    // Return messages as JSON
    echo json_encode($messages);
} else {
    
    echo "No messages found.";
}

$conn->close();
?>