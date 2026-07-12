import pexpect
import sys

def run_ssh_command(host, port, user, password, command):
    # Using bash -s to pass the multi-line script correctly
    ssh_cmd = f"ssh -p {port} {user}@{host} 'bash -s'"
    print(f"Running SSH Connection...")
    
    child = pexpect.spawn(ssh_cmd, encoding='utf-8', timeout=600) # 10 mins timeout
    
    while True:
        index = child.expect([
            r'Are you sure you want to continue connecting',
            r'(?i)password:',
            pexpect.EOF,
            pexpect.TIMEOUT
        ])
        
        if index == 0:
            child.sendline('yes')
        elif index == 1:
            child.sendline(password)
            break
        elif index == 2:
            print("EOF before password prompt. Output:")
            print(child.before)
            sys.exit(1)
        elif index == 3:
            print("Timeout waiting for SSH prompt.")
            sys.exit(1)
            
    # Send the bash script to standard input
    child.sendline(command)
    child.sendline("exit") # Close the SSH connection after script finishes
    
    # Print the output in real-time
    try:
        while True:
            line = child.readline()
            if not line:
                break
            print(line, end='')
    except pexpect.EOF:
        print("SSH connection closed.")
    except pexpect.TIMEOUT:
        print("Command timed out.")
        sys.exit(1)

if __name__ == "__main__":
    script = """
set -e
echo "-> Navigation vers le dossier gestion..."
cd domains/brunchbouake.com/public_html/gestion

echo "-> Nettoyage de l'ancien dépôt Git..."
rm -rf .git

echo "-> Initialisation du nouveau dépôt..."
git init
git remote add origin https://github.com/fasopost2965/Brunch-Boake-PMS-Version-studio.git

echo "-> Récupération du code depuis GitHub..."
git fetch origin main

echo "-> Remplacement des fichiers par la nouvelle version..."
git reset --hard origin/main

echo "-> Suppression des anciens fichiers non suivis..."
git clean -fd

echo "-> Création du fichier .env de production..."
cat << 'EOF' > .env
MYSQL_HOST=localhost
MYSQL_USER=u707543112_bb_db_v1
MYSQL_PASSWORD=Prodesk@2965
MYSQL_DATABASE=u707543112_bb_db_v1
MYSQL_PORT=3306
PORT=3000
NODE_ENV=production
EOF

echo "-> Installation des dépendances NPM..."
npm install

echo "-> Compilation du projet (Build)..."
npm run build

echo "-> Déploiement terminé avec succès."
"""
    run_ssh_command("92.113.19.95", "65002", "u707543112", "Sonko@2029", script)
