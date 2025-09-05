import time
import zipfile
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

PLUGIN_FILE = "plugin.zip"

def create_dummy_plugin():
    """Bikin plugin.zip dummy kalau belum ada"""
    if os.path.exists(PLUGIN_FILE):
        return
    os.makedirs("plugin", exist_ok=True)
    with open("plugin/plugin.php", "w") as f:
        f.write("""<?php
/*
Plugin Name: Dummy Test Plugin
Description: Plugin dummy untuk test upload.
Version: 1.0
Author: Sky
*/
?>""")
    with zipfile.ZipFile(PLUGIN_FILE, "w") as zipf:
        zipf.write("plugin/plugin.php", "plugin.php")
    print(f"[INFO] Dummy plugin '{PLUGIN_FILE}' dibuat.")

def upload_plugin(driver, site):
    try:
        site = site.strip()
        if not site or "#" not in site or "@" not in site:
            return f"[SKIPPED] {site} → format salah (harus url#user@pass)"

        url, creds = site.split("#", 1)
        user, pw = creds.split("@", 1)

        login_url = url
        upload_url = url.replace("wp-login.php", "wp-admin/plugin-install.php?tab=upload")

        # buka halaman login
        driver.get(login_url)

        # isi username & password
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "user_login"))).send_keys(user)
        driver.find_element(By.ID, "user_pass").send_keys(pw)
        driver.find_element(By.ID, "wp-submit").click()

        # cek login sukses
        time.sleep(2)
        if "wp-login.php" in driver.current_url:
            return f"[FAILED LOGIN] {url} {user}:{pw}"

        # buka halaman upload plugin
        driver.get(upload_url)

        # upload file
        file_input = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "pluginzip")))
        file_input.send_keys(os.path.abspath(PLUGIN_FILE))

        # klik tombol install
        driver.find_element(By.ID, "install-plugin-submit").click()

        # tunggu hasil
        time.sleep(5)
        page_source = driver.page_source

        if "Plugin installed successfully" in page_source or "Activate Plugin" in page_source:
            return f"[SUCCESS] {url} {user}:{pw} → Plugin uploaded"
        elif "The uploaded file could not be moved" in page_source:
            return f"[FAILED] {url} {user}:{pw} → Permission error (gagal upload)"
        elif "FTP" in page_source:
            return f"[FAILED] {url} {user}:{pw} → FTP required"
        else:
            return f"[UNKNOWN] {url} {user}:{pw} → Cek manual"

    except Exception as e:
        return f"[ERROR] {site} → {e}"

def main():
    create_dummy_plugin()

    chrome_options = Options()
    chrome_options.add_argument("--headless")  # hapus kalau mau lihat browsernya
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(service=Service(), options=chrome_options)

    with open("list.txt") as f:
        sites = f.readlines()

    with open("result.txt", "w") as out:
        for site in sites:
            res = upload_plugin(driver, site)
            print(res)
            out.write(res + "\n")

    driver.quit()

if __name__ == "__main__":
    main()
