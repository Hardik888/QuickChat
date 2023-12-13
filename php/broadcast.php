<?php

require 'vendor/autoload.php'; // Include Composer autoloader

use sngrl\PhpFirebaseCloudMessaging\Client;
use sngrl\PhpFirebaseCloudMessaging\Message;
use sngrl\PhpFirebaseCloudMessaging\Recipient\Device;
use sngrl\PhpFirebaseCloudMessaging\Notification;

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "library";


$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


$data = json_decode(file_get_contents("php://input"));


$senderId = $data->sender_id;
$messageText = $data->message_text;


$userIds = getAllUserIds($conn);


foreach ($userIds as $userId) {
    $sql = "INSERT INTO messages (sender_id, receiver_id, message_text) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iis", $senderId, $userId, $messageText);
    $stmt->execute();

   
    $receiverFcmToken = '';

  
    sendPushNotification($receiverFcmToken, $messageText);
}

$stmt->close();
$conn->close();

function getAllUserIds($conn) {
    $userIds = [];

    $result = $conn->query("SELECT id FROM users");

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $userIds[] = $row['id'];
        }
    }

    return $userIds;
}

function getFcmTokenForUser($conn, $userId) {
    $result = $conn->query("SELECT fcm_token FROM users WHERE id = $userId");

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['fcm_token'];
    }

    return null;
}

function sendPushNotification($receiverFcmToken, $message)
{
    $API_ACCESS_KEY = ''; // Replace with your FCM server key

    $client = new Client();
    $client->setApiKey($API_ACCESS_KEY);

    $messageObj = new Message();
    $notification = new Notification('New Message', $message);
    $messageObj->setNotification($notification);
    $messageObj->addRecipient(new Device($receiverFcmToken));

    // Debugging: Output the JSON payload before sending
    echo 'Request Payload: ' . json_encode($messageObj) . PHP_EOL;

    try {
        $client->send($messageObj);
        echo 'Notification sent successfully to ' . $receiverFcmToken . PHP_EOL;
    } catch (\Exception $e) {
        echo 'Error: ' . $e->getMessage() . PHP_EOL;
    }
}
?>
