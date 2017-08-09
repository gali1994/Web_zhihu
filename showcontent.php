<?php
	require 'config.php';
	
	$sql=mysql_query("SELECT (select count(*) from comment where titleid=a.id) as count, a.id,a.title,a.content,a.user,a.date	 FROM question a ORDER BY date");
	
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