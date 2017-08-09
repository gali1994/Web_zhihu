<?php
	sleep(3);
	require 'config.php';
	$query = "INSERT INTO user (userName,userPwd,userEmail,userSex,userBirth,userDate) VALUES ('{$_POST['user']}','{$_POST['password']}','{$_POST['email']}','{$_POST['sex']}','{$_POST['birth']}',NOW())";
	//echo mysql_query($query);
	mysql_query($query) or die ('新增失败：'.mysql_error());
	
	echo mysql_affected_rows();
	mysql_close();
?>