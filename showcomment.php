<?php
	sleep(1);
	require 'config.php';
	$query = mysql_query("SELECT COUNT(*) AS count FROM comment WHERE titleid='{$_POST['titleid']}'");
	$result = mysql_fetch_array($query,MYSQL_ASSOC);
	$_pagesize=2;
	$count=ceil($result['count']/$_pagesize);
	$_page=1;
	if(!isset($_POST['page'])){
		$_page=1;
	}else{
		$_page=$_POST['page'];
		if($_page>$count){
			$_page=$count;
		}
	}
	
	$_limit=($_page-1)*$_pagesize;
	
	$sql=mysql_query("SELECT ({$count}) AS count, titleid,comment,user,date FROM comment WHERE titleid='{$_POST['titleid']}' ORDER BY date DESC LIMIT {$_limit},{$_pagesize}");
	
	$json='';
	
	
	while(!!$row =mysql_fetch_array($sql,MYSQL_ASSOC)){
		foreach($row as $key =>$value){
			$row[$key]=urlencode(str_replace('\n','',$value));
		}
		$json.=urldecode(json_encode($row)).',';
	
	}
	echo '['.substr($json,0,strlen($json)-1).']';
	mysql_close();
	
	
?>