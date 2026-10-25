<?php
// Anfrageformular almromantik.at – schickt die Anfrage per E-Mail. Speichert nichts auf dem Server.
header('Content-Type: application/json; charset=utf-8');
$TO = 'info@almromantik.at';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo '{"ok":false}'; exit; }
if (!empty($_POST['website'])) { echo '{"ok":true}'; exit; }           // Spam-Falle
$f = fn($k) => trim(strip_tags($_POST[$k] ?? ''));
$d = ['welt'=>$f('welt'),'vorname'=>$f('vorname'),'nachname'=>$f('nachname'),'email'=>$f('email'),'telefon'=>$f('telefon'),
      'erwachsene'=>(int)($_POST['erwachsene'] ?? 0),'kinder'=>(int)($_POST['kinder'] ?? 0),'kinderalter'=>$f('kinderalter'),
      'anreise'=>$f('anreise'),'abreise'=>$f('abreise'),'wuensche'=>$f('wuensche')];
$err = [];
if ($d['vorname']==='' || $d['nachname']==='') $err[]='name';
if (!filter_var($d['email'], FILTER_VALIDATE_EMAIL)) $err[]='email';
if ($d['erwachsene']<1 || $d['erwachsene']>15 || $d['kinder']<0 || $d['kinder']>15) $err[]='personen';
if ($d['kinder']>0 && $d['kinderalter']==='') $err[]='kinderalter';
$an = strtotime($d['anreise']); $ab = strtotime($d['abreise']);
if (!$an || !$ab || $an < strtotime('today') || $ab <= $an) $err[]='datum';
if (($_POST['datenschutz'] ?? '') !== 'ja') $err[]='datenschutz';
if ($err) { http_response_code(422); echo json_encode(['ok'=>false,'err'=>$err]); exit; }
$clean = fn($s) => str_replace(["\r","\n"], ' ', $s);
$body = "Neue Anfrage über almromantik.at\n\n"
 ."Urlaubswelt: {$d['welt']}\nName: {$d['vorname']} {$d['nachname']}\nE-Mail: {$d['email']}\nTelefon: {$d['telefon']}\n"
 ."Erwachsene: {$d['erwachsene']}\nKinder: {$d['kinder']}".($d['kinder']?" (Alter: {$d['kinderalter']})":"")."\n"
 ."Anreise: ".date('d.m.Y',$an)."\nAbreise: ".date('d.m.Y',$ab)."\n\nWünsche:\n{$d['wuensche']}\n\n"
 ."Datenschutz-Zustimmung: ja (".date('d.m.Y H:i').")\n";
$subject = '=?UTF-8?B?'.base64_encode('Anfrage '.$clean($d['welt']).' – '.$clean($d['vorname'].' '.$d['nachname'])).'?=';
$headers = "From: Almromantik Website <$TO>\r\nReply-To: ".$clean($d['email'])."\r\nContent-Type: text/plain; charset=utf-8\r\n";
$ok = mail($TO, $subject, $body, $headers);
echo json_encode(['ok'=>$ok]);
