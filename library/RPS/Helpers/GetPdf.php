<?php
class RPS_Helpers_GetPdf
{

    public function setPath($thePath)
    {
        $this->thePath = $thePath;
    }

    private function getPath()
    {
        return $this->thePath;
    }

    public function countFiles()
    {
        if (@$hndDir = opendir($this->getPath())) {
            $intCount = 0;
            while (false !== ($strFilename = readdir($hndDir))) {
                if ($strFilename != "." && $strFilename != ".." && substr($strFilename, 0, 2 != "._")) {
                    $intCount ++;
                }
            }
            closedir($hndDir);
        } else {
            $intCount = - 1;
        }
        return $intCount;
    }

    public function build()
    {
        if (@$handle = opendir($this->getPath())) {
            while (false !== ($file = readdir($handle))) {
                if ($file != "." && $file != ".." && substr($file, 0, 2 != "._")) {
                    $contents[] = $file;
                }
            }
            closedir($handle);
            if (count($contents > 1)) {
                foreach ($contents as $file) {
                    $length = strlen($file);
                    $characters = 4;
                    $start = $length - $characters;
                    $fileExt = substr($file, $start, $characters);
                    if ($fileExt == '.pdf' && substr($file, 0, 2 != "._")) {
                        echo '<option value="http://static.fterceiro.pt' . $this->getPath() . '/' . $file . '">' . $this->shortenText($file) . '</option>';
                    }
                }
            } else {
                return 0;
            }
        }
    }

    private function shortenText($text, $chars = 25)
    {
        $length = strlen($text);
        $text = strip_tags($text);
        $text = substr($text, 0, $chars);
        if ($length > $chars) {
            $text = $text . "...";
        }
        return $text;
    }
}
?>