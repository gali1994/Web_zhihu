<?php
	require 'config.php';
	
	$sql=mysql_query("SELECT userName,userPwd from user WHERE userName='{$_POST['log_user']}' AND userPwd='{$_POST['log_password']}' ");
	
	if(mysql_fetch_array($sql,MYSQL_ASSOC)){
		echo 'false';
	}else{
		echo 'true';
	}
	
	mysql_close();
?>