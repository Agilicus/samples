## Github sync

This repo on Gitlab is set to auto-sync to [github](https://github.com/Agilicus/samples).
A deploy-key exists which is authorised for this purpose.

Conceptually it does the same as:

```
git remote add github git@github.com:Agilicus/samples.git
git push -u origin main
git push -u github main
```
