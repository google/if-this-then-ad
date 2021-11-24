import shell from 'shelljs';

shell.cp('-R', 'static', '../dist/static');
shell.cp('package*', '../dist/');
