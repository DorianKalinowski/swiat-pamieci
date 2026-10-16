Add-Type -AssemblyName System.Drawing
function Make($size, $path) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $rect = New-Object System.Drawing.Rectangle 0,0,$size,$size
  $br = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.ColorTranslator]::FromHtml('#7c5cff')), ([System.Drawing.ColorTranslator]::FromHtml('#ff6bd6')), 45
  $g.FillRectangle($br, $rect)
  $k = $size / 512.0
  function P($x,$y){ New-Object System.Drawing.PointF ([single](($x*0.7+76)*$k)), ([single](($y*0.7+90)*$k)) }
  $orange = [System.Drawing.ColorTranslator]::FromHtml('#ffb35c')
  $dark = [System.Drawing.ColorTranslator]::FromHtml('#2b2140')
  $ob = New-Object System.Drawing.SolidBrush $orange
  $db = New-Object System.Drawing.SolidBrush $dark
  $wb = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $pk = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#ff7a90'))
  # ears
  $g.FillPolygon($ob, @((P 70 120),(P 80 20),(P 190 100),(P 190 140)))
  $g.FillPolygon($ob, @((P 440 120),(P 430 20),(P 320 100),(P 320 140)))
  # head
  $a = P 62 70; $b = P 450 390
  $g.FillEllipse($ob, $a.X, $a.Y, ($b.X-$a.X), ($b.Y-$a.Y))
  # eyes
  foreach ($cx in 190,320) {
    $e1 = P ($cx-30) 180; $e2 = P ($cx+30) 252
    $g.FillEllipse($db, $e1.X, $e1.Y, ($e2.X-$e1.X), ($e2.Y-$e1.Y))
    $h1 = P ($cx-3) 192; $h2 = P ($cx+19) 214
    $g.FillEllipse($wb, $h1.X, $h1.Y, ($h2.X-$h1.X), ($h2.Y-$h1.Y))
  }
  $g.FillPolygon($pk, @((P 238 270),(P 274 270),(P 256 292)))
  $pen = New-Object System.Drawing.Pen $dark, ([single](12*0.7*$k))
  $pen.StartCap='Round'; $pen.EndCap='Round'
  $g.DrawCurve($pen, @((P 200 306),(P 230 318),(P 256 292)))
  $g.DrawCurve($pen, @((P 256 292),(P 282 318),(P 312 306)))
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}
Make 192 "$PSScriptRoot\..\icons\icon-192.png"
Make 512 "$PSScriptRoot\..\icons\icon-512.png"
