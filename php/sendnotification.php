<?php

require 'vendor/autoload.php'; // 
use sngrl\PhpFirebaseCloudMessaging\Client;
use sngrl\PhpFirebaseCloudMessaging\Message;
use sngrl\PhpFirebaseCloudMessaging\Recipient\Device;
use sngrl\PhpFirebaseCloudMessaging\Notification;


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


$data = json_decode(file_get_contents("php://input"));


$senderId = $data->sender_id;
$receiverId = $data->receiver_id;
$messageText = $data->message_text;

$sql = "INSERT INTO messages (sender_id, receiver_id, message_text) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iis", $senderId, $receiverId, $messageText);
$stmt->execute();


$receiverFcmToken = '';

// Send push notification to the receiver using FCM
sendPushNotification($receiverFcmToken, $messageText);

$stmt->close();
$conn->close();


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
        echo 'Notification sent successfully.' . PHP_EOL;
    } catch (\Exception $e) {
        echo 'Error: ' . $e->getMessage() . PHP_EOL;
    }
}
?>