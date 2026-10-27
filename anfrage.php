<?php
// Anfrageformular almromantik.at – schickt die Anfrage per E-Mail an Heike.
// Läuft auf dem Server bei Web Experts (PHP). Speichert nichts auf dem Server.
declare(strict_types=1);
$EMPFAENGER = 'info@almromantik.at';
$ABSENDER   = 'info@almromantik.at';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
function antwort(bool $ok, int $code = 200): void { http_response_code($code); echo json_encode(['ok' => $ok]); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') antwort(false, 405);
if (!empty($_POST['website'])) antwort(true);                 // Spam-Falle: Bots füllen das versteckte Feld aus
function f(string $k, int $max = 200): string { $v = trim((string)($_POST[$k] ?? '')); $v = str_replace(["\r", "\n"], ' ', $v); return mb_substr($v, 0, $max); }
$vn = f('vorname'); $nn = f('nachname'); $mail = f('email'); $tel = f('telefon', 40);
$welt = f('welt', 60); $an = f('anreise', 10); $ab = f('abreise', 10);
$erw = (int)f('erwachsene', 3); $kin = (int)f('kinder', 3);
$wunsch = mb_substr(trim((string)($_POST['wuensche'] ?? '')), 0, 3000);
$wohn = array_map(fn($w) => mb_substr(str_replace(["\r", "\n"], ' ', trim((string)$w)), 0, 40), (array)($_POST['wohnung'] ?? []));
if ($vn === '' || $nn === '' || !filter_var($mail, FILTER_VALIDATE_EMAIL) || ($_POST['datenschutz'] ?? '') !== 'ja'
    || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $an) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $ab) || $ab <= $an) antwort(false, 422);
$d = fn($s) => date('d.m.Y', strtotime($s));
$text = "Neue Anfrage über almromantik.at\n\n"
  . "Unterkunft: $welt" . ($wohn ? " (" . implode(', ', $wohn) . ")" : "") . "\n"
  . "Name: $vn $nn\nE-Mail: $mail\nTelefon: " . ($tel ?: '-') . "\n"
  . "Anreise: {$d($an)}\nAbreise: {$d($ab)}\nErwachsene: $erw\nKinder: $kin\n\n"
  . "Nachricht:\n" . ($wunsch ?: '-') . "\n";
$betreff = '=?UTF-8?B?' . base64_encode("Anfrage $welt: $vn $nn, {$d($an)}–{$d($ab)}") . '?=';
$kopf = "From: Almromantik Website <$ABSENDER>\r\nReply-To: $mail\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit";
antwort(mail($EMPFAENGER, $betreff, $text, $kopf, "-f$ABSENDER"));
