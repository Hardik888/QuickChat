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

// Fetch messages with sender and receiver names
$sql = "SELECT m.id, m.sender_id, m.receiver_id, m.message_text, m.timestamp, u1.name AS sender_name, u2.name AS receiver_name
        FROM messages m
        JOIN users u1 ON m.sender_id = u1.id
        JOIN users u2 ON m.receiver_id = u2.id";

$result = $conn->query($sql);

// Check if there are any messages
if ($result->num_rows > 0) {
    // Fetch messages and store them in an array
    $messages = array();
    while ($row = $result->fetch_assoc()) {
        $messages[] = array(
            'id' => $row['id'],
            'sender_id' => $row['sender_id'],
            'receiver_id' => $row['receiver_id'],
            'sender_name' => $row['sender_name'],
            'receiver_name' => $row['receiver_name'],
            'message_text' => $row['message_text'],
            'timestamp' => $row['timestamp'],
            // Add more fields as needed
        );
    }

    // Return messages as JSON
    echo json_encode($messages);
} else {
    // No messages found
    echo "No messages found.";
}

$conn->close();
?>